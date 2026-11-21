"""Invoice numbering and dating for paid registrations."""

import asyncio
import io

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


def _inr(amount: int) -> str:
    """Whole rupees with Indian digit grouping, e.g. 150000 -> Rs. 1,50,000 (core PDF fonts lack the rupee sign)."""
    digits = str(amount)
    if len(digits) > 3:
        head, tail = digits[:-3], digits[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        digits = ",".join(groups + [tail])
    return f"Rs. {digits}"


def build_invoice_pdf(
    *,
    invoice_number: str,
    invoice_date: str | None,
    name: str,
    email: str | None,
    player_id: str,
    amount: int,
    payment_id: str | None,
    organiser: str,
    address_lines: list[str],
    gstin: str,
    event_name: str,
    event_label: str,
) -> bytes:
    """Render the invoice as a single-page A4 PDF and return its bytes."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle
    from xml.sax.saxutils import escape as e

    navy = colors.HexColor("#0E1A2B")
    muted = colors.HexColor("#4A5568")
    line = colors.HexColor("#E3E7ED")

    base = getSampleStyleSheet()["Normal"]
    body = ParagraphStyle("body", parent=base, fontName="Helvetica", fontSize=10, leading=14)
    small = ParagraphStyle("small", parent=body, fontSize=9, textColor=muted)
    title = ParagraphStyle("title", parent=body, fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=navy)
    right = ParagraphStyle("right", parent=body, alignment=2)

    amount_text = _inr(amount)
    buf = io.BytesIO()
    doc = BaseDocTemplate(buf, pagesize=A4, title=f"Invoice {invoice_number}", author=organiser)
    width, height = A4
    frame = Frame(20 * mm, 20 * mm, width - 40 * mm, height - 40 * mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="invoice", frames=[frame])])

    seller = f"<b>{e(organiser)}</b>" + "".join(f"<br/>{e(l)}" for l in address_lines)
    if gstin:
        seller += f"<br/>GSTIN: {e(gstin)}"
    meta = f"<b>Invoice no:</b> {e(invoice_number)}"
    if invoice_date:
        meta += f"<br/><b>Date:</b> {e(invoice_date)}"
    header = Table([[Paragraph(seller, body), Paragraph(meta, right)]], colWidths=[105 * mm, 65 * mm])
    header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))

    bill_to = f"<b>{e(name)}</b>" + (f"<br/>{e(email)}" if email else "") + f"<br/>Registration ID: {e(player_id)}"

    items = Table(
        [
            [Paragraph("<b>Description</b>", body), Paragraph("<b>Amount</b>", right)],
            [Paragraph(f"Player registration fee<br/><font size='9' color='#4A5568'>{e(event_name)} ({e(event_label)})</font>", body), Paragraph(e(amount_text), right)],
            [Paragraph("<b>Total paid</b>", body), Paragraph(f"<b>{e(amount_text)}</b>", right)],
        ],
        colWidths=[125 * mm, 45 * mm],
    )
    items.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 1, navy),
        ("LINEBELOW", (0, 1), (-1, 1), 0.5, line),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    story = [
        Paragraph("INVOICE", title), Spacer(1, 8 * mm), header, Spacer(1, 8 * mm),
        Paragraph("Billed to", small), Paragraph(bill_to, body), Spacer(1, 8 * mm), items, Spacer(1, 6 * mm),
        Paragraph("Payment received" + (f" &middot; Reference: {e(payment_id)}" if payment_id else ""), small),
        Spacer(1, 12 * mm),
        Paragraph("This is a computer-generated invoice and does not require a signature.", small),
    ]
    doc.build(story)
    return buf.getvalue()
