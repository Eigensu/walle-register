from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from enum import Enum

from beanie import Document, Indexed
from pydantic import EmailStr, Field
from pydantic.config import ConfigDict


class RegistrationStatus(str, Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    FAILED = "FAILED"
    APPROVED = "APPROVED"


def ist_now() -> datetime:
    """Return current time in Indian Standard Time (IST)"""
    return datetime.now(ZoneInfo("Asia/Kolkata"))


class Player(Document):
    # Personal Details
    first_name: str
    last_name: str
    email: Indexed(EmailStr, unique=True)  # type: ignore[assignment]
    phone: Indexed(str, unique=True)  # type: ignore[assignment]
    residential_area: str
    firm_name: str
    designation: str
    photo_url: str
    aadhar_number: str
    city: str
    village: str

    # Cricket Details
    batting_type: str
    bowling_type: str
    wicket_keeper: str
    
    # Jersey Details
    name_on_jersey: str
    tshirt_size: str
    waist_size: int
    
    # JMCL Season 1 Details
    played_JMCL_S2: str
    JMCL_S2_team: str = ""
    
    # Registration Status
    registration_status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT
    created_at: datetime = Field(default_factory=ist_now)

    model_config = ConfigDict(str_strip_whitespace=True)

    class Settings:
        name = "players"
        indexes = [
            "email",
            "phone",
            "-created_at",
        ]
