"""Application settings and environment bootstrap."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from pydantic import EmailStr, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Locate the nearest .env walking upward; fall back to CWD/.env
_env_candidates = [p / ".env" for p in Path(__file__).resolve().parents]
ROOT_ENV_PATH = next((p for p in _env_candidates if p.exists()), Path(".env"))
load_dotenv(ROOT_ENV_PATH, override=False)

SUPPORTED_GATEWAYS = ("razorpay", "cashfree")


class Settings(BaseSettings):
	mongo_url: str = Field(..., alias="MONGO_URL")
	mongo_db: str = Field(..., alias="MONGO_DB")
	cors_origins: str | list[str] = Field(default_factory=list, alias="CORS_ORIGINS")

	# Which payment gateways players can use: "razorpay", "cashfree" or "razorpay,cashfree".
	# Order matters: the first one is shown first on the payment step.
	payment_gateways: str | list[str] = Field(default="razorpay", alias="PAYMENT_GATEWAYS")

	razorpay_key_id: str | None = Field(default=None, alias="RAZORPAY_KEY_ID")
	razorpay_key_secret: str | None = Field(default=None, alias="RAZORPAY_KEY_SECRET")
	razorpay_webhook_secret: str | None = Field(default=None, alias="RAZORPAY_WEBHOOK_SECRET")

	cashfree_app_id: str | None = Field(default=None, alias="CASHFREE_APP_ID")
	cashfree_secret_key: str | None = Field(default=None, alias="CASHFREE_SECRET_KEY")
	cashfree_env: Literal["sandbox", "production"] = Field(default="sandbox", alias="CASHFREE_ENV")
	cashfree_api_version: str = Field(default="2025-01-01", alias="CASHFREE_API_VERSION")

	registration_fee_inr: int = Field(default=15000, alias="REGISTRATION_FEE_INR")

	storage_mode: Literal["local", "s3", "cloudinary"] = Field(default="local", alias="STORAGE_MODE")
	s3_bucket: str | None = Field(default=None, alias="S3_BUCKET")
	s3_region: str | None = Field(default=None, alias="S3_REGION")
	s3_access_key_id: str | None = Field(default=None, alias="S3_ACCESS_KEY_ID")
	s3_secret_access_key: str | None = Field(default=None, alias="S3_SECRET_ACCESS_KEY")

	cloudinary_cloud_name: str | None = Field(default=None, alias="CLOUDINARY_CLOUD_NAME")
	cloudinary_api_key: str | None = Field(default=None, alias="CLOUDINARY_API_KEY")
	cloudinary_api_secret: str | None = Field(default=None, alias="CLOUDINARY_API_SECRET")
	cloudinary_folder: str = Field(default="walle-register", alias="CLOUDINARY_FOLDER")

	admin_username: str = Field(default="admin", alias="ADMIN_USERNAME")
	admin_password: str = Field(..., alias="ADMIN_PASSWORD")

	# Email Settings
	mail_username: str = Field(..., alias="MAIL_USERNAME")
	mail_password: str = Field(..., alias="MAIL_PASSWORD")
	mail_from: EmailStr = Field(..., alias="MAIL_FROM")
	mail_port: int = Field(default=465, alias="MAIL_PORT")
	mail_server: str = Field(default="smtp.gmail.com", alias="MAIL_SERVER")
	mail_from_name: str = Field(default="NSPL Registration Team", alias="MAIL_FROM_NAME")
	# Shown in the footer and used as Reply-To when set; leave unset until the event has an official address.
	mail_support_email: EmailStr | None = Field(default=None, alias="MAIL_SUPPORT_EMAIL")

	# Event branding used in the confirmation email
	organiser_name: str = Field(default="Silver Youth Forum", alias="ORGANISER_NAME")
	event_name: str = Field(default="National Silver Premier League", alias="EVENT_NAME")
	event_short_name: str = Field(default="NSPL", alias="EVENT_SHORT_NAME")
	event_season: str = Field(default="Season 2", alias="EVENT_SEASON")

	model_config = SettingsConfigDict(
		env_file=ROOT_ENV_PATH,
		env_file_encoding="utf-8",
		extra="ignore",
	)

	@field_validator("payment_gateways", mode="before")
	@classmethod
	def parse_payment_gateways(cls, value: str | list[str]) -> list[str]:
		items = value if isinstance(value, list) else str(value or "").split(",")
		gateways: list[str] = []
		for item in items:
			name = item.strip().lower()
			if not name:
				continue
			if name not in SUPPORTED_GATEWAYS:
				raise ValueError(
					f"Unknown payment gateway '{name}' in PAYMENT_GATEWAYS. "
					f"Use one or both of: {', '.join(SUPPORTED_GATEWAYS)}"
				)
			if name not in gateways:
				gateways.append(name)
		if not gateways:
			raise ValueError("PAYMENT_GATEWAYS must enable at least one gateway")
		return gateways

	@model_validator(mode="after")
	def check_gateway_credentials(self) -> "Settings":
		if "razorpay" in self.payment_gateways and not (self.razorpay_key_id and self.razorpay_key_secret):
			raise ValueError("Razorpay is enabled in PAYMENT_GATEWAYS but RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing")
		if "cashfree" in self.payment_gateways and not (self.cashfree_app_id and self.cashfree_secret_key):
			raise ValueError("Cashfree is enabled in PAYMENT_GATEWAYS but CASHFREE_APP_ID / CASHFREE_SECRET_KEY are missing")
		return self

	@field_validator("cors_origins", mode="before")
	@classmethod
	def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
		"""Convert comma-separated or JSON-array-like string to list."""
		if isinstance(value, list):
			return value
		if not value:
			return []
		value = value.strip()
		if not value:
			return []
		# Accept JSON-style list or fall back to comma separation
		if value.startswith("[") and value.endswith("]"):
			# Remove brackets and split by comma
			inner = value[1:-1].strip()
			if not inner:
				return []
			return [v.strip().strip('"\'') for v in inner.split(",") if v.strip()]
		# Simple comma-separated list
		return [v.strip() for v in value.split(",") if v.strip()]

	@field_validator("mail_support_email", mode="before")
	@classmethod
	def blank_support_email_is_unset(cls, value: str | None) -> str | None:
		"""Treat an empty MAIL_SUPPORT_EMAIL as unset instead of failing startup."""
		if isinstance(value, str) and not value.strip():
			return None
		return value


@lru_cache
def get_settings() -> Settings:
	return Settings()  # type: ignore[call-arg]


def env_path() -> str:
	return str(ROOT_ENV_PATH)
