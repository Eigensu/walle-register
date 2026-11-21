"""Invoice numbering and dating for paid registrations."""

import asyncio

from pymongo import ReturnDocument

from app.models.payment import Payment, ist_now

_COUNTER_ID = "invoice"
_WAIT_TRIES = 20
_WAIT_DELAY = 0.1


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

    collection = Payment.get_motor_collection()
    # Win the right to number this payment *before* touching the counter, so a lost race
    # never consumes a number and the series stays gapless.
    claim = await collection.update_one(
        {"_id": payment.id, "invoice_number": None, "invoice_claimed": {"$ne": True}},
        {"$set": {"invoice_claimed": True, "paid_at": ist_now()}},
    )
    if claim.modified_count == 1:
        number = f"INV-{await _next_sequence():06d}"
        await collection.update_one({"_id": payment.id}, {"$set": {"invoice_number": number}})

    # Losers wait briefly for the winner to finish writing the number.
    for _ in range(_WAIT_TRIES):
        fresh = await collection.find_one({"_id": payment.id}, {"invoice_number": 1, "paid_at": 1})
        if fresh and fresh.get("invoice_number") and fresh.get("paid_at"):
            payment.invoice_number = fresh["invoice_number"]
            payment.paid_at = fresh["paid_at"]
            return payment.invoice_number, _format_date(payment.paid_at)
        await asyncio.sleep(_WAIT_DELAY)
    raise RuntimeError(f"Invoice number not assigned for payment {payment.id}")


def _format_date(value) -> str:
    """Format as e.g. '20 Nov 2026' in IST. Mongo returns naive datetimes in UTC."""
    from datetime import timezone
    from zoneinfo import ZoneInfo

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%d %b %Y")
