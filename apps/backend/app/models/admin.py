from datetime import datetime

from beanie import Document, Indexed
from pydantic import Field

from app.models.player import ist_now


class Admin(Document):
    """An admin added from the admin panel. The ADMIN_USERNAME/ADMIN_PASSWORD env admin is not stored here."""

    username: Indexed(str, unique=True)  # type: ignore[valid-type]
    password_hash: str
    created_by: str | None = None
    created_at: datetime = Field(default_factory=ist_now)

    class Settings:
        name = "admins"
