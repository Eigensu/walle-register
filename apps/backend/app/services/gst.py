"""GST breakup for the registration invoice.

The registration fee is GST-inclusive, so the tax is carved out of the amount the player paid and
the total never changes. Amounts are worked in paise (integers) to avoid rounding drift.
"""

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class GstBreakup:
    rate: int  # total GST rate in percent, e.g. 18
    taxable: int  # paise
    cgst: int  # paise; 0 for an inter-state supply
    sgst: int  # paise; 0 for an inter-state supply
    igst: int  # paise; 0 for an intra-state supply
    total: int  # paise; equals what the player paid

    @property
    def intra_state(self) -> bool:
        return self.igst == 0


def state_code(gstin: str | None) -> str:
    """The two-digit state code a GSTIN starts with, or '' when there is none."""
    code = (gstin or "").strip()[:2]
    return code if code.isdigit() and len(code) == 2 else ""


def compute_gst_breakup(
    amount_inr: int, *, rate: int, seller_gstin: str | None, buyer_gstin: str | None
) -> GstBreakup | None:
    """Split a GST-inclusive amount (whole rupees) into taxable value and tax.

    Returns None when no breakup applies: the seller has no GSTIN, or the rate is not positive.
    A buyer in the seller's state, or with no GSTIN (their state is unknown), gets CGST + SGST;
    a buyer whose GSTIN starts with another state's code gets IGST.
    """
    if not (seller_gstin or "").strip() or rate <= 0:
        return None
    total = amount_inr * 100
    tax = int((Decimal(total) * rate / (100 + rate)).quantize(Decimal(1), rounding=ROUND_HALF_UP))
    buyer_state = state_code(buyer_gstin)
    if buyer_state and buyer_state != state_code(seller_gstin):
        return GstBreakup(rate, total - tax, 0, 0, tax, total)
    # CGST and SGST are equal halves; the taxable value absorbs any odd paisa so the parts add up.
    half = tax // 2
    return GstBreakup(rate, total - 2 * half, half, half, 0, total)


def format_paise(paise: int, symbol: str) -> str:
    """Indian digit grouping with two decimals, e.g. 610170 -> '6,101.70' (prefixed with the symbol)."""
    rupees, rest = divmod(paise, 100)
    digits = str(rupees)
    if len(digits) > 3:
        head, tail = digits[:-3], digits[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        digits = ",".join(groups + [tail])
    return f"{symbol}{digits}.{rest:02d}"
