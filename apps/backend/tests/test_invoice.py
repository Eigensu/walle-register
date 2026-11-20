import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from app.services import invoice
from app.services.email_service import build_success_email
from app.services.email_service import settings as email_settings

INVOICE = dict(email="player@example.com", invoice_number="INV-000042", invoice_date="20 Nov 2026")


def _build(**kwargs):
    return build_success_email("Test <Player>", "pid1", 15000, "pay_1", **kwargs)


def test_email_without_invoice_has_no_invoice_section():
    _, html, text = _build()
    assert "Invoice" not in html
    assert "INVOICE" not in text


def test_email_with_invoice_shows_details_in_html_and_text():
    _, html, text = _build(**INVOICE)
    for needle in ("INV-000042", "20 Nov 2026", "player@example.com", "₹15,000"):
        assert needle in html and needle in text
    assert "Test &lt;Player&gt;" in html  # name is escaped
    assert "Test <Player>" not in html


def test_invoice_shows_multiline_address_and_gstin():
    with patch.object(email_settings, "organiser_address", "Line one|Line two"), \
         patch.object(email_settings, "organiser_gstin", " 27ABCDE1234F1Z5 "):
        _, html, text = _build(**INVOICE)
    assert "Line one<br>Line two" in html
    assert "GSTIN: 27ABCDE1234F1Z5" in html
    assert "Line one\nLine two\nGSTIN: 27ABCDE1234F1Z5" in text


def test_invoice_omits_blank_gstin_and_address():
    with patch.object(email_settings, "organiser_address", None), \
         patch.object(email_settings, "organiser_gstin", "  "):
        _, html, text = _build(**INVOICE)
    assert "GSTIN" not in html and "GSTIN" not in text


def test_format_date_converts_utc_to_ist():
    # 19:00 UTC on 19 Nov is 00:30 IST on 20 Nov
    assert invoice._format_date(datetime(2026, 11, 19, 19, 0)) == "20 Nov 2026"


def _fake_collection(stored):
    coll = MagicMock()
    coll.database = {"counters": MagicMock(find_one_and_update=AsyncMock(return_value={"seq": 7}))}
    coll.update_one = AsyncMock()
    coll.find_one = AsyncMock(return_value=stored)
    return coll


def test_ensure_invoice_assigns_sequential_number_once():
    payment = MagicMock(id=1, invoice_number=None, paid_at=None)
    coll = _fake_collection({"invoice_number": "INV-000007", "paid_at": datetime(2026, 11, 19, 19, 0)})
    with patch.object(invoice.Payment, "get_motor_collection", return_value=coll):
        result = asyncio.run(invoice.ensure_invoice(payment))
    assert result == ("INV-000007", "20 Nov 2026")
    # Only fills in when unset, so a concurrent caller can't overwrite an existing invoice.
    assert coll.update_one.call_args.args[0] == {"_id": 1, "invoice_number": None}


def test_ensure_invoice_reuses_existing_without_touching_counter():
    payment = MagicMock(id=1, invoice_number="INV-000003", paid_at=datetime(2026, 11, 19, 19, 0))
    coll = _fake_collection(None)
    with patch.object(invoice.Payment, "get_motor_collection", return_value=coll):
        result = asyncio.run(invoice.ensure_invoice(payment))
    assert result == ("INV-000003", "20 Nov 2026")
    coll.update_one.assert_not_called()
