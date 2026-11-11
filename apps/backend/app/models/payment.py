from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from enum import Enum

from beanie import Document, Indexed
from beanie.odm.fields import PydanticObjectId
from pydantic import Field
from pydantic.config import ConfigDict


class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    CAPTURED = "CAPTURED"
    FAILED = "FAILED"


def ist_now() -> datetime:
    """Return current time in Indian Standard Time (IST)"""
    return datetime.now(ZoneInfo("Asia/Kolkata"))


class PaymentGateway(str, Enum):
    RAZORPAY = "razorpay"
    CASHFREE = "cashfree"


class Payment(Document):
    player_id: PydanticObjectId
    # Existing records predate multi-gateway support, so they default to Razorpay.
    gateway: PaymentGateway = PaymentGateway.RAZORPAY
    # Gateway order id. Kept under its original name (and unique index) so existing data and
    # indexes keep working. For Cashfree this holds our Cashfree order_id (prefixed "cf_").
    razorpay_order_id: Indexed(str, unique=True)  # type: ignore[assignment]
    razorpay_payment_id: str | None = None
    razorpay_signature: str | None = None
    cashfree_payment_id: str | None = None
    status: PaymentStatus = PaymentStatus.CREATED
    amount: int
    currency: str = "INR"
    created_at: datetime = Field(default_factory=ist_now)

    model_config = ConfigDict(str_strip_whitespace=True)

    class Settings:
        name = "payments"
        indexes = [
            "player_id",
            "razorpay_order_id",
            "status",
            "-created_at",
        ]
