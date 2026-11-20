"""Invoice numbering and dating for paid registrations."""

from pymongo import ReturnDocument

from app.models.payment import Payment, ist_now

_COUNTER_ID = "invoice"


async def _next_sequence() -> int:
    """Atomically increment and return the invoice counter (safe across processes)."""
    counters = Payment.get_motor_collection().database["counters"]
    doc = await counters.find_one_and_update(
        {"_id": _COUNTER_ID},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return int(doc["seq"])


async def ensure_invoice(payment: Payment) -> tuple[str, str]:
    """Return (invoice_number, invoice_date) for a captured payment, assigning them once.

    The number is sequential and unique; the date is the time the payment was captured
    (IST), stored on the payment so a re-send shows the same values.
    """
    if payment.invoice_number and payment.paid_at:
        return payment.invoice_number, _format_date(payment.paid_at)

    number = f"INV-{await _next_sequence():06d}"
    paid_at = ist_now()
    collection = Payment.get_motor_collection()
    # Only fill in when unset, so concurrent callers can't overwrite an existing invoice.
    await collection.update_one(
        {"_id": payment.id, "invoice_number": None},
        {"$set": {"invoice_number": number, "paid_at": paid_at}},
    )
    fresh = await collection.find_one({"_id": payment.id}, {"invoice_number": 1, "paid_at": 1})
    payment.invoice_number = fresh["invoice_number"]
    payment.paid_at = fresh["paid_at"]
    return payment.invoice_number, _format_date(payment.paid_at)


def _format_date(value) -> str:
    """Format as e.g. '20 Nov 2026' in IST. Mongo returns naive datetimes in UTC."""
    from datetime import timezone
    from zoneinfo import ZoneInfo

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y")
