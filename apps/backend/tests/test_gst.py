from unittest.mock import patch

from app.services import invoice
from app.services.email_service import build_success_email
from app.services.email_service import settings as email_settings
from app.services.gst import compute_gst_breakup, format_paise, state_code

SELLER = "27ABSCS6609M1ZG"


def test_intra_state_splits_into_equal_cgst_and_sgst_that_add_up_to_the_amount_paid():
    b = compute_gst_breakup(7200, rate=18, seller_gstin=SELLER, buyer_gstin="")
    assert (b.cgst, b.sgst, b.igst) == (54915, 54915, 0)
    assert b.taxable == 610170
    assert b.taxable + b.cgst + b.sgst == b.total == 720000


def test_other_state_buyer_gets_igst():
    b = compute_gst_breakup(7200, rate=18, seller_gstin=SELLER, buyer_gstin="29ABCDE1234F1Z5")
    assert (b.cgst, b.sgst, b.igst) == (0, 0, 109831)
    assert b.taxable + b.igst == b.total == 720000


def test_same_state_buyer_gets_cgst_and_sgst():
    b = compute_gst_breakup(7200, rate=18, seller_gstin=SELLER, buyer_gstin="27ABCDE1234F1Z5")
    assert b.intra_state


def test_no_breakup_without_seller_gstin_or_rate():
    assert compute_gst_breakup(7200, rate=18, seller_gstin="  ", buyer_gstin="") is None
    assert compute_gst_breakup(7200, rate=0, seller_gstin=SELLER, buyer_gstin="") is None


def test_state_code_and_money_formatting():
    assert state_code(" 27ABC") == "27" and state_code("") == "" and state_code("AB123") == ""
    assert format_paise(610170, "₹") == "₹6,101.70"
    assert format_paise(12345678, "Rs. ") == "Rs. 1,23,456.78"


def _build(buyer="", sac=None, rate=18):
    with patch.object(email_settings, "gst_rate_percent", rate), patch.object(email_settings, "sac_code", sac):
        return build_success_email(
            "Test Player", "pid1", 7200, "pay_1",
            email="p@example.com", invoice_number="INV-1", invoice_date="20 Nov 2026", buyer_gstin=buyer,
        )


def test_email_invoice_shows_cgst_sgst_and_sac():
    _, html, text = _build(sac="999699")
    for out in (html, text):
        assert "CGST @ 9%" in out and "SGST @ 9%" in out and "₹549.15" in out
        assert "₹6,101.70" in out and "₹7,200.00" in out and "SAC: 999699" in out
        assert "IGST" not in out


def test_email_invoice_shows_igst_for_other_state_buyer():
    _, html, text = _build(buyer="29ABCDE1234F1Z5")
    for out in (html, text):
        assert "IGST @ 18%" in out and "₹1,098.31" in out
        assert "CGST" not in out


def test_email_invoice_without_rate_or_sac_has_no_tax_lines():
    _, html, text = _build(rate=0)
    assert "GST @" not in html and "SAC" not in html and "SAC" not in text


def _pdf(**kwargs):
    return invoice.build_invoice_pdf(
        invoice_number="INV-1", invoice_date="20 Nov 2026", name="Test Player", email="p@example.com",
        player_id="pid1", amount=7200, payment_id="pay_1", organiser="SYF", address_lines=["Mumbai"],
        gstin=SELLER, event_name="NSPL", event_label="NSPL Season 2", **kwargs,
    )


def test_pdf_builds_with_and_without_the_tax_breakup():
    assert _pdf(gst_rate=18, sac_code="999699", buyer_gstin="").startswith(b"%PDF")
    assert _pdf(gst_rate=18, buyer_gstin="29ABCDE1234F1Z5").startswith(b"%PDF")
    assert _pdf().startswith(b"%PDF")
