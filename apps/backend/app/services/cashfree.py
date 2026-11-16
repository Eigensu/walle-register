"""Cashfree Payment Gateway (PG) client.

Docs:
- Create order:  POST {base}/orders           https://www.cashfree.com/docs/api-reference/payments/latest/orders/create
- Get order:     GET  {base}/orders/{id}
- Order payments GET  {base}/orders/{id}/payments
- Webhook signature: base64(HMAC-SHA256(secret_key, x-webhook-timestamp + raw_body))
  https://www.cashfree.com/docs/payments/online/webhooks/signature-verification
"""

import base64
import hashlib
import hmac
from typing import Any, Literal

import httpx
from fastapi import HTTPException, status

BASE_URLS = {
    "sandbox": "https://sandbox.cashfree.com/pg",
    "production": "https://api.cashfree.com/pg",
}


class CashfreeService:
    def __init__(
        self,
        app_id: str,
        secret_key: str,
        env: Literal["sandbox", "production"] = "sandbox",
        api_version: str = "2025-01-01",
    ):
        self.app_id = app_id
        self.secret_key = secret_key
        self.env = env
        self.base_url = BASE_URLS[env]
        self._client = httpx.AsyncClient(
            timeout=15,
            headers={
                "x-client-id": app_id,
                "x-client-secret": secret_key,
                "x-api-version": api_version,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )

    async def _request(self, method: str, path: str, **kwargs: Any) -> Any:
        try:
            response = await self._client.request(method, f"{self.base_url}{path}", **kwargs)
        except httpx.HTTPError as exc:  # network failures
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Cashfree unreachable: {exc}") from exc

        if response.status_code not in (200, 201):
            try:
                message = response.json().get("message") or response.text
            except ValueError:
                message = response.text
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cashfree error: {message}")

        return response.json()

    async def create_order(
        self,
        *,
        order_id: str,
        amount_inr: float,
        customer_id: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        return_url: str | None = None,
        note: str | None = None,
    ) -> dict[str, Any]:
        """Create an order. Amount is in rupees (not paise). Returns the order entity incl. payment_session_id."""
        payload: dict[str, Any] = {
            "order_id": order_id,
            "order_amount": round(float(amount_inr), 2),
            "order_currency": "INR",
            "customer_details": {
                "customer_id": customer_id,
                "customer_name": customer_name,
                "customer_email": customer_email,
                "customer_phone": customer_phone,
            },
        }
        if return_url:
            payload["order_meta"] = {"return_url": return_url}
        if note:
            payload["order_note"] = note
        return await self._request("POST", "/orders", json=payload)

    async def get_order(self, order_id: str) -> dict[str, Any]:
        return await self._request("GET", f"/orders/{order_id}")

    async def get_order_payments(self, order_id: str) -> list[dict[str, Any]]:
        return await self._request("GET", f"/orders/{order_id}/payments")

    def verify_webhook_signature(self, raw_body: bytes, timestamp: str, signature: str) -> bool:
        message = timestamp.encode() + raw_body
        digest = hmac.new(self.secret_key.encode(), message, hashlib.sha256).digest()
        expected = base64.b64encode(digest).decode()
        return hmac.compare_digest(expected, signature)

    async def aclose(self) -> None:
        await self._client.aclose()


def normalize_indian_phone(phone: str) -> str:
    """Cashfree wants a 10-digit number; international numbers must start with '+'."""
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10:
        return digits
    return f"+{digits}"
