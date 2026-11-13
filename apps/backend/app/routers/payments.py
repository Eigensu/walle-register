import logging
import secrets
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from pydantic import BaseModel
from beanie import PydanticObjectId
from bson.errors import InvalidId

from app.core.config import Settings
from app.models.payment import Payment, PaymentGateway, PaymentStatus
from app.models.player import Player, RegistrationStatus
from app.services.cashfree import CashfreeService, normalize_indian_phone
from app.services.razorpay import RazorpayService
from app.services.email_service import send_success_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CreateOrderRequest(BaseModel):
    player_id: str


class CreateOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int
    currency: str
    player_id: str


class VerifyPaymentRequest(BaseModel):
    player_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    status: str
    message: str


async def get_settings(request: Request) -> Settings:
    return request.app.state.settings  # type: ignore[attr-defined]


async def get_razorpay(request: Request) -> RazorpayService:
    razorpay = getattr(request.app.state, "razorpay", None)
    if razorpay is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Razorpay is not configured")
    return razorpay


async def get_cashfree(request: Request) -> CashfreeService:
    cashfree = getattr(request.app.state, "cashfree", None)
    if cashfree is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Cashfree is not configured")
    return cashfree


def ensure_gateway_enabled(settings: Settings, gateway: PaymentGateway) -> None:
    """New payments may only start on gateways listed in PAYMENT_GATEWAYS.

    Verification and webhooks stay open for any configured gateway so payments that were
    started before a gateway was switched off still complete.
    """
    if gateway.value not in settings.payment_gateways:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{gateway.value.capitalize()} payments are currently disabled",
        )


def parse_player_id(raw: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(raw)
    except (InvalidId, TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found") from exc


# How far back to look for Cashfree orders that might still complete (e.g. a pending UPI payment).
INFLIGHT_LOOKBACK = timedelta(hours=24)
INFLIGHT_MAX_ORDERS = 5


async def load_payable_player(player_id: PydanticObjectId, cashfree: CashfreeService | None) -> Player:
    """Load a player who is allowed to start a new payment, on any gateway."""
    player = await Player.get(player_id)
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    if player.registration_status == RegistrationStatus.PAID:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already paid")

    existing_payment = await Payment.find_one(Payment.player_id == player_id, Payment.status == PaymentStatus.CAPTURED)
    if existing_payment:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Payment already captured")

    under_review = await Payment.find_one(Payment.player_id == player_id, Payment.status == PaymentStatus.NEEDS_REVIEW)
    if under_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="We received a payment from you that our team is checking. Please contact support instead of paying again.",
        )

    await ensure_no_inflight_cashfree_payment(player_id, cashfree)
    return player


async def ensure_no_inflight_cashfree_payment(player_id: PydanticObjectId, cashfree: CashfreeService | None) -> None:
    """Refuse a new order (on either gateway) while an earlier Cashfree order could still be paid.

    A UPI payment can sit in PENDING for minutes before it succeeds; letting the player pay
    again in the meantime would charge them twice. Each recent unpaid Cashfree order is
    re-checked with Cashfree: a late success is recorded, a pending one blocks the new order.
    """
    if cashfree is None:
        return
    since = datetime.now(timezone.utc) - INFLIGHT_LOOKBACK
    recent = (
        await Payment.find(
            Payment.player_id == player_id,
            Payment.gateway == PaymentGateway.CASHFREE,
            Payment.status == PaymentStatus.CREATED,
            Payment.created_at >= since,
        )
        .sort(-Payment.created_at)
        .limit(INFLIGHT_MAX_ORDERS)
        .to_list()
    )
    for payment in recent:
        # This path ends in a 409, and FastAPI skips request background tasks on error
        # responses, so collect them here and run them ourselves (the confirmation email).
        own_tasks = BackgroundTasks()
        try:
            result_status, _ = await _sync_cashfree_order(payment, cashfree, own_tasks)
        except HTTPException as exc:
            # Cashfree unreachable: don't let a Cashfree outage block paying via Razorpay.
            logger.warning(
                "Could not re-check Cashfree order %s before new order: %s", payment.razorpay_order_id, exc.detail
            )
            continue
        if result_status == "CAPTURED":
            await own_tasks()
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already paid")
        if result_status == "NEEDS_REVIEW":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="We received a payment from you that our team is checking. Please contact support instead of paying again.",
            )
        if result_status == "PENDING":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Your previous payment is still being processed. Please wait a few minutes before trying again.",
            )


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_order(
    payload: CreateOrderRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
    razorpay: RazorpayService = Depends(get_razorpay),
):
    ensure_gateway_enabled(settings, PaymentGateway.RAZORPAY)
    player_id = parse_player_id(payload.player_id)
    player = await load_payable_player(player_id, getattr(request.app.state, "cashfree", None))

    amount_paise = settings.registration_fee_inr * 100
    order = await razorpay.create_order(amount=amount_paise, currency="INR", receipt=str(player.id))

    payment = Payment(
        player_id=player_id,
        gateway=PaymentGateway.RAZORPAY,
        razorpay_order_id=order.get("id"),
        amount=amount_paise,
        currency="INR",
        status=PaymentStatus.CREATED,
    )
    await payment.insert()

    return CreateOrderResponse(
        razorpay_order_id=payment.razorpay_order_id,
        amount=payment.amount,
        currency=payment.currency,
        player_id=str(player.id),
    )


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    payload: VerifyPaymentRequest,
    settings: Settings = Depends(get_settings),
    razorpay: RazorpayService = Depends(get_razorpay),
):
    player_id = parse_player_id(payload.player_id)

    payment = await Payment.find_one(Payment.razorpay_order_id == payload.razorpay_order_id, Payment.player_id == player_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    is_valid = razorpay.verify_signature(
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
    )

    if not is_valid:
        payment.status = PaymentStatus.FAILED
        payment.razorpay_payment_id = payload.razorpay_payment_id
        payment.razorpay_signature = payload.razorpay_signature
        await payment.save()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    payment.status = PaymentStatus.CAPTURED
    payment.razorpay_payment_id = payload.razorpay_payment_id
    payment.razorpay_signature = payload.razorpay_signature
    await payment.save()

    player = await Player.get(player_id)
    if player:
        player.registration_status = RegistrationStatus.PAID
        await player.save()

    return VerifyPaymentResponse(status="CAPTURED", message="Payment verified")


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings),
    razorpay: RazorpayService = Depends(get_razorpay),
):
    """Handle Razorpay webhook events."""
    if not settings.razorpay_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured"
        )

    # Get signature and body
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing signature header"
        )

    body_bytes = await request.body()

    # Verify signature
    is_valid = razorpay.verify_webhook_signature(
        body=body_bytes,
        signature=signature,
        webhook_secret=settings.razorpay_webhook_secret
    )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )

    # Parse event
    payload = await request.json()
    event_type = payload.get("event")

    # Handle payment.captured event
    if event_type == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if not order_id or not payment_id:
            return {"status": "ignored", "reason": "missing order_id or payment_id"}

        # Find payment by order ID
        payment = await Payment.find_one(Payment.razorpay_order_id == order_id)
        if not payment:
            return {"status": "ignored", "reason": "payment record not found"}

        # Update payment status
        payment.status = PaymentStatus.CAPTURED
        payment.razorpay_payment_id = payment_id
        await payment.save()

        # Update player status
        player = await Player.get(payment.player_id)
        if player:
            player.registration_status = RegistrationStatus.PAID
            await player.save()
            
            # Send confirmation email
            full_name = f"{player.first_name} {player.last_name}"
            amount_inr = payment.amount // 100  # Convert paise to rupees
            
            # Send email asynchronously (non-blocking)
            background_tasks.add_task(
                send_success_email,
                to_email=player.email,
                name=full_name,
                player_id=str(player.id),
                amount=amount_inr,
                payment_id=payment_id
            )

    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Cashfree
# ---------------------------------------------------------------------------


class CashfreeCreateOrderRequest(BaseModel):
    player_id: str
    # Page Cashfree sends the player back to if checkout ends in a redirect
    # (e.g. some UPI / net-banking flows). "?order_id=<id>" is appended.
    return_url: str | None = None


class CashfreeCreateOrderResponse(BaseModel):
    order_id: str
    payment_session_id: str
    amount: int  # paise, same unit as the Razorpay response
    currency: str
    player_id: str
    mode: str  # "sandbox" | "production", passed to the Cashfree JS SDK


class CashfreeVerifyRequest(BaseModel):
    order_id: str
    player_id: str | None = None


class CashfreeVerifyResponse(BaseModel):
    status: str  # CAPTURED | PENDING | NEEDS_REVIEW | FAILED | NOT_PAID
    message: str
    player_id: str


def _build_return_url(base: str | None, order_id: str) -> str | None:
    if not base:
        return None
    parsed = urlparse(base)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None
    url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?order_id={order_id}"
    return url if len(url) <= 250 else None


async def _mark_cashfree_captured(
    payment: Payment, cf_payment_id: str | None, background_tasks: BackgroundTasks
) -> None:
    """Mark payment + player as paid. Sends the confirmation email exactly once,
    whichever of /verify or the webhook gets here first."""
    collection = Payment.get_motor_collection()
    update: dict = {"status": PaymentStatus.CAPTURED.value}
    if cf_payment_id:
        update["cashfree_payment_id"] = cf_payment_id
    result = await collection.update_one(
        {"_id": payment.id, "status": {"$ne": PaymentStatus.CAPTURED.value}},
        {"$set": update},
    )
    newly_captured = result.modified_count == 1

    player = await Player.get(payment.player_id)
    if not player:
        return
    if player.registration_status != RegistrationStatus.PAID:
        player.registration_status = RegistrationStatus.PAID
        await player.save()

    if newly_captured:
        background_tasks.add_task(
            send_success_email,
            to_email=player.email,
            name=f"{player.first_name} {player.last_name}",
            player_id=str(player.id),
            amount=payment.amount // 100,
        )


async def _sync_cashfree_order(
    payment: Payment, cashfree: CashfreeService, background_tasks: BackgroundTasks
) -> tuple[str, str]:
    """Ask Cashfree for the real order status (never trust the browser) and update our records."""
    order = await cashfree.get_order(payment.razorpay_order_id)
    order_status = order.get("order_status")

    if order_status == "PAID":
        expected = round(payment.amount / 100, 2)
        paid = round(float(order.get("order_amount", 0)), 2)
        if paid != expected or order.get("order_currency") != payment.currency:
            logger.error(
                "Cashfree amount mismatch for %s: expected %s %s, got %s %s. Marked NEEDS_REVIEW.",
                payment.razorpay_order_id, expected, payment.currency, paid, order.get("order_currency"),
            )
            # Money may have been taken, so don't treat it as failed; park it for a human.
            await Payment.get_motor_collection().update_one(
                {"_id": payment.id, "status": {"$nin": [PaymentStatus.CAPTURED.value, PaymentStatus.NEEDS_REVIEW.value]}},
                {"$set": {"status": PaymentStatus.NEEDS_REVIEW.value}},
            )
            return (
                "NEEDS_REVIEW",
                "We received your payment but need to verify it. Our team will contact you shortly; please don't pay again.",
            )

        cf_payment_id = None
        try:
            payments = await cashfree.get_order_payments(payment.razorpay_order_id)
            success = next((p for p in payments if p.get("payment_status") == "SUCCESS"), None)
            if success:
                cf_payment_id = str(success.get("cf_payment_id"))
        except HTTPException:
            logger.warning("Could not fetch Cashfree payments for %s", payment.razorpay_order_id)

        await _mark_cashfree_captured(payment, cf_payment_id, background_tasks)
        return "CAPTURED", "Payment verified"

    # Not paid (yet). Look at the latest attempt to give the player a useful message.
    latest_status = None
    try:
        payments = await cashfree.get_order_payments(payment.razorpay_order_id)
        if payments:
            latest = max(payments, key=lambda p: p.get("payment_time") or "")
            latest_status = latest.get("payment_status")
    except HTTPException:
        pass

    if latest_status == "PENDING":
        return "PENDING", "Your payment is being processed. We'll confirm by email once it completes."
    if latest_status in ("FAILED", "USER_DROPPED", "CANCELLED", "VOID") or order_status in ("EXPIRED", "TERMINATED"):
        if payment.status == PaymentStatus.CREATED:
            payment.status = PaymentStatus.FAILED
            await payment.save()
        return "FAILED", "Payment was not completed. Please try again."
    return "NOT_PAID", "Payment not completed yet."


@router.post("/cashfree/create-order", response_model=CashfreeCreateOrderResponse)
async def cashfree_create_order(
    payload: CashfreeCreateOrderRequest,
    settings: Settings = Depends(get_settings),
    cashfree: CashfreeService = Depends(get_cashfree),
):
    ensure_gateway_enabled(settings, PaymentGateway.CASHFREE)
    player_id = parse_player_id(payload.player_id)
    player = await load_payable_player(player_id, cashfree)

    # Cashfree order_id: 3-45 chars, alphanumeric / "_" / "-". Unique per attempt.
    # e.g. cf_<24-char player id>_<unix ts>_<6 hex> = 44 chars.
    order_id = f"cf_{player.id}_{int(time.time())}_{secrets.token_hex(3)}"
    amount_paise = settings.registration_fee_inr * 100

    order = await cashfree.create_order(
        order_id=order_id,
        amount_inr=settings.registration_fee_inr,
        customer_id=str(player.id),
        customer_name=f"{player.first_name} {player.last_name}".strip(),
        customer_email=player.email,
        customer_phone=normalize_indian_phone(player.phone),
        return_url=_build_return_url(payload.return_url, order_id),
        note="Player registration fee",
    )
    session_id = order.get("payment_session_id")
    if not session_id:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Cashfree did not return a payment session")

    payment = Payment(
        player_id=player_id,
        gateway=PaymentGateway.CASHFREE,
        razorpay_order_id=order.get("order_id", order_id),
        amount=amount_paise,
        currency="INR",
        status=PaymentStatus.CREATED,
    )
    await payment.insert()

    return CashfreeCreateOrderResponse(
        order_id=payment.razorpay_order_id,
        payment_session_id=session_id,
        amount=amount_paise,
        currency="INR",
        player_id=str(player.id),
        mode=cashfree.env,
    )


@router.post("/cashfree/verify", response_model=CashfreeVerifyResponse)
async def cashfree_verify(
    payload: CashfreeVerifyRequest,
    background_tasks: BackgroundTasks,
    cashfree: CashfreeService = Depends(get_cashfree),
):
    payment = await Payment.find_one(
        Payment.razorpay_order_id == payload.order_id,
        Payment.gateway == PaymentGateway.CASHFREE,
    )
    if not payment or (payload.player_id and str(payment.player_id) != payload.player_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    if payment.status == PaymentStatus.CAPTURED:
        return CashfreeVerifyResponse(status="CAPTURED", message="Payment verified", player_id=str(payment.player_id))
    if payment.status == PaymentStatus.NEEDS_REVIEW:
        return CashfreeVerifyResponse(
            status="NEEDS_REVIEW",
            message="We received your payment but need to verify it. Our team will contact you shortly; please don't pay again.",
            player_id=str(payment.player_id),
        )

    result_status, message = await _sync_cashfree_order(payment, cashfree, background_tasks)
    return CashfreeVerifyResponse(status=result_status, message=message, player_id=str(payment.player_id))


@router.post("/cashfree/webhook")
async def cashfree_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    cashfree: CashfreeService = Depends(get_cashfree),
):
    """Cashfree payment webhooks (PAYMENT_SUCCESS / FAILED / USER_DROPPED).

    Signed with the Cashfree secret key; no separate webhook secret is needed.
    """
    signature = request.headers.get("x-webhook-signature")
    timestamp = request.headers.get("x-webhook-timestamp")
    if not signature or not timestamp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature headers")

    raw_body = await request.body()  # must verify against the raw bytes, not re-serialised JSON
    if not cashfree.verify_webhook_signature(raw_body, timestamp, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    try:
        payload = await request.json()
    except ValueError:
        return {"status": "ignored", "reason": "body is not JSON"}
    if not isinstance(payload, dict):
        return {"status": "ignored", "reason": "unexpected payload"}
    event_type = payload.get("type")
    data = payload.get("data")
    order = data.get("order") if isinstance(data, dict) else None
    order_id = order.get("order_id") if isinstance(order, dict) else None

    if event_type not in ("PAYMENT_SUCCESS_WEBHOOK", "PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"):
        return {"status": "ignored", "reason": f"unhandled event {event_type}"}
    if not order_id:
        return {"status": "ignored", "reason": "missing order_id"}

    payment = await Payment.find_one(
        Payment.razorpay_order_id == order_id,
        Payment.gateway == PaymentGateway.CASHFREE,
    )
    if not payment:
        return {"status": "ignored", "reason": "payment record not found"}
    if payment.status in (PaymentStatus.CAPTURED, PaymentStatus.NEEDS_REVIEW):
        return {"status": "ok"}

    # Re-check with the Cashfree API so the final state always comes from Cashfree itself.
    await _sync_cashfree_order(payment, cashfree, background_tasks)
    return {"status": "ok"}
