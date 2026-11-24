import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import BackgroundTasks, HTTPException

from app.models.payment import PaymentStatus
from app.routers import payments


def _payment(order_id="cf_1", status=PaymentStatus.CREATED):
    return MagicMock(razorpay_order_id=order_id, player_id="p1", status=status, amount=720000, currency="INR", save=AsyncMock())


def _run_reconcile(pending, sync, **kwargs):
    with patch.object(payments, "_unpaid_cashfree_payments", AsyncMock(return_value=pending)), \
         patch.object(payments, "_sync_cashfree_order", sync):
        return asyncio.run(payments.reconcile_cashfree_payments(MagicMock(), **kwargs))


def test_reconcile_counts_paid_orders_and_runs_their_email_tasks():
    sent = []

    async def sync(payment, cashfree, tasks, **kwargs):
        if payment.razorpay_order_id == "cf_paid":
            tasks.add_task(_record, sent, payment.razorpay_order_id)
            return "CAPTURED", "Payment verified"
        return "NOT_PAID", "Payment not completed yet."

    async def _record(bucket, value):
        bucket.append(value)

    found = _run_reconcile([_payment("cf_paid"), _payment("cf_open")], sync)

    assert found == 1
    assert sent == ["cf_paid"]  # the confirmation email task ran, not just queued


def test_reconcile_never_marks_orders_failed():
    sync = AsyncMock(return_value=("NOT_PAID", ""))
    _run_reconcile([_payment()], sync)
    assert sync.await_args.kwargs == {"mark_failed": False}


def test_reconcile_gives_up_after_consecutive_failures_then_resumes_next_pass():
    sync = AsyncMock(side_effect=HTTPException(status_code=502, detail="Cashfree unreachable"))
    pending = [_payment(f"cf_{i}") for i in range(10)]

    assert _run_reconcile(pending, sync) == 0
    assert sync.await_count == payments.RECONCILE_MAX_FAILURES  # stopped early instead of 10 timeouts


def test_reconcile_one_bad_order_does_not_block_the_rest():
    async def sync(payment, cashfree, tasks, **kwargs):
        if payment.razorpay_order_id == "cf_bad":
            raise RuntimeError("boom")
        return "CAPTURED", "Payment verified"

    found = _run_reconcile([_payment("cf_bad"), _payment("cf_good")], sync)
    assert found == 1


def test_reconcile_a_success_resets_the_failure_count():
    outcomes = iter([HTTPException(502, "x"), HTTPException(502, "x"), ("CAPTURED", ""), HTTPException(502, "x"), HTTPException(502, "x")])

    async def sync(payment, cashfree, tasks, **kwargs):
        outcome = next(outcomes)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    found = _run_reconcile([_payment(f"cf_{i}") for i in range(5)], sync)
    assert found == 1  # all five were attempted: two failures, a success, two more failures


def test_reconcile_with_nothing_pending_does_not_call_cashfree():
    sync = AsyncMock()
    assert _run_reconcile([], sync) == 0
    sync.assert_not_awaited()


def _cashfree(order_status, attempts):
    cashfree = MagicMock()
    cashfree.get_order = AsyncMock(return_value={"order_status": order_status})
    cashfree.get_order_payments = AsyncMock(return_value=attempts)
    return cashfree


FAILED_ATTEMPT = [{"payment_status": "FAILED", "payment_time": "2026-11-23T13:40:00+05:30"}]


def test_sync_marks_failed_attempts_failed_by_default():
    payment = _payment()
    result = asyncio.run(payments._sync_cashfree_order(payment, _cashfree("ACTIVE", FAILED_ATTEMPT), BackgroundTasks()))
    assert result[0] == "FAILED"
    assert payment.status == PaymentStatus.FAILED
    payment.save.assert_awaited_once()


def test_sync_can_leave_a_failed_attempt_open_for_a_retry():
    payment = _payment()
    result = asyncio.run(
        payments._sync_cashfree_order(payment, _cashfree("ACTIVE", FAILED_ATTEMPT), BackgroundTasks(), mark_failed=False)
    )
    assert result[0] == "FAILED"  # still reported to the caller...
    assert payment.status == PaymentStatus.CREATED  # ...but the order stays payable and re-checkable
    payment.save.assert_not_awaited()


def test_loop_checks_older_orders_only_every_tenth_pass_and_survives_errors():
    calls = []

    async def reconcile(cashfree, *, include_older):
        calls.append(include_older)
        if len(calls) == 3:
            raise RuntimeError("database hiccup")  # must not stop the loop
        return 0

    sleeps = []

    async def sleep(seconds):
        sleeps.append(seconds)
        if len(sleeps) == 12:
            raise asyncio.CancelledError

    with patch.object(payments, "reconcile_cashfree_payments", reconcile), patch.object(payments.asyncio, "sleep", sleep):
        with pytest.raises(asyncio.CancelledError):
            asyncio.run(payments.run_cashfree_reconciler(MagicMock(), 60))

    assert len(calls) == 12
    assert [i for i, older in enumerate(calls) if older] == [0, 10]
    assert set(sleeps) == {60}
