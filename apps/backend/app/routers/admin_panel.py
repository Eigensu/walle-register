"""API for the standalone admin panel (apps/admin).

Event-agnostic on purpose: players are returned with whatever fields they were stored with, so a
new event's form can add or rename fields without changes here. Every route except /login needs
an `Authorization: Bearer <token>` header from /login.
"""

import csv
import io
import re
from datetime import datetime, timezone
from typing import Any

from beanie.odm.fields import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from app.models.admin import Admin
from app.models.config import AppConfig
from app.models.payment import Payment, PaymentStatus
from app.models.player import Player
from app.services.admin_auth import (
    AdminIdentity,
    CurrentAdmin,
    authenticate,
    hash_password,
    issue_token,
)

router = APIRouter(prefix="/api/admin-panel", tags=["admin-panel"])

# Fields never sent to the panel's player list (heavy or sensitive); the detail view shows them.
_LIST_FIELDS = {
    "first_name": 1,
    "last_name": 1,
    "email": 1,
    "phone": 1,
    "registration_status": 1,
    "created_at": 1,
}


# ---------- helpers ----------


async def _config() -> AppConfig:
    cfg = await AppConfig.find_one({})
    if cfg is None:
        cfg = AppConfig()
        await cfg.insert()
    return cfg


def _jsonable(value: Any) -> Any:
    if isinstance(value, datetime):
        # Mongo hands back naive datetimes that are UTC; mark them so browsers don't read them as local time.
        return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).isoformat()
    if isinstance(value, PydanticObjectId) or type(value).__name__ == "ObjectId":
        return str(value)
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_jsonable(v) for v in value]
    return value


def _payment_summary(payments: list[dict]) -> dict | None:
    """The captured payment if any, otherwise the most recent attempt."""
    chosen = None
    for doc in sorted(payments, key=lambda d: d.get("created_at") or datetime.min):
        if chosen is None or chosen.get("status") != PaymentStatus.CAPTURED.value:
            chosen = doc
    if chosen is None:
        return None
    return {
        "status": chosen.get("status"),
        "gateway": chosen.get("gateway", "razorpay"),
        "amount": chosen.get("amount"),
        "currency": chosen.get("currency"),
        "created_at": _jsonable(chosen.get("created_at")),
    }


async def _payments_by_player(player_ids: list) -> dict:
    if not player_ids:
        return {}
    docs = await Payment.get_motor_collection().find({"player_id": {"$in": player_ids}}).to_list(None)
    grouped: dict = {}
    for doc in docs:
        grouped.setdefault(doc.get("player_id"), []).append(doc)
    return {pid: _payment_summary(items) for pid, items in grouped.items()}


def _player_query(search: str | None, registration_status: str | None) -> dict:
    query: dict = {}
    if registration_status:
        query["registration_status"] = registration_status
    if search and search.strip():
        pattern = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [
            {"first_name": pattern},
            {"last_name": pattern},
            {"email": pattern},
            {"phone": pattern},
            {"firm_name": pattern},
        ]
    return query


async def _stats() -> dict:
    players = Player.get_motor_collection()
    by_status = await players.aggregate(
        [{"$group": {"_id": "$registration_status", "count": {"$sum": 1}}}]
    ).to_list(None)
    counts = {row["_id"] or "UNKNOWN": row["count"] for row in by_status}
    return {"total": sum(counts.values()), "by_status": counts}


# ---------- auth ----------


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(payload: LoginRequest, request: Request):
    settings = request.app.state.settings  # type: ignore[attr-defined]
    identity = await authenticate(payload.username, payload.password, settings)
    if identity is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong username or password")
    return {
        "token": issue_token(identity, settings),
        "username": identity.username,
        "is_owner": identity.is_owner,
    }


@router.get("/me")
async def me(admin: AdminIdentity = CurrentAdmin):
    return {"username": admin.username, "is_owner": admin.is_owner}


# ---------- overview & registration controls ----------


class ConfigUpdate(BaseModel):
    registration_open: bool | None = None
    registration_cap: int | None = Field(default=None, ge=0, le=1_000_000)


async def _config_response() -> dict:
    cfg = await _config()
    stats = await _stats()
    return {
        "registration_open": cfg.registration_open,
        "registration_cap": cfg.registration_cap,
        # The cap counts every saved registration, paid or not (same rule as POST /api/register).
        "current_registrations": stats["total"],
        "registration_cap_reached": stats["total"] >= cfg.registration_cap,
        "by_status": stats["by_status"],
    }


@router.get("/overview")
async def overview(admin: AdminIdentity = CurrentAdmin):
    return await _config_response()


@router.patch("/config")
async def update_config(payload: ConfigUpdate, admin: AdminIdentity = CurrentAdmin):
    cfg = await _config()
    if payload.registration_open is not None:
        cfg.registration_open = payload.registration_open
    if payload.registration_cap is not None:
        cfg.registration_cap = payload.registration_cap
    await cfg.save()
    return await _config_response()


# ---------- players ----------


@router.get("/players")
async def list_players(
    page: int = 1,
    limit: int = 50,
    search: str | None = None,
    registration_status: str | None = None,
    admin: AdminIdentity = CurrentAdmin,
):
    page = max(page, 1)
    limit = min(max(limit, 1), 200)
    query = _player_query(search, registration_status)
    collection = Player.get_motor_collection()

    total = await collection.count_documents(query)
    docs = (
        await collection.find(query, _LIST_FIELDS)
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
        .to_list(None)
    )
    payments = await _payments_by_player([d["_id"] for d in docs])

    players = []
    for doc in docs:
        item = _jsonable(doc)
        item["id"] = item.pop("_id")
        item["payment"] = payments.get(doc["_id"])
        players.append(item)
    return {"players": players, "total": total, "page": page, "limit": limit}


@router.get("/players/export.csv")
async def export_players(
    search: str | None = None,
    registration_status: str | None = None,
    admin: AdminIdentity = CurrentAdmin,
):
    docs = (
        await Player.get_motor_collection()
        .find(_player_query(search, registration_status))
        .sort("created_at", -1)
        .to_list(None)
    )
    payments = await _payments_by_player([d["_id"] for d in docs])

    rows = []
    columns: list[str] = []
    for doc in docs:
        row = _jsonable(doc)
        row["id"] = row.pop("_id")
        row.pop("revision_id", None)
        payment = payments.get(doc["_id"]) or {}
        row["payment_status"] = payment.get("status", "")
        row["payment_gateway"] = payment.get("gateway", "")
        for key in row:
            if key not in columns:
                columns.append(key)
        rows.append(row)
    # Put id first; keep every other field in the order it first appears.
    columns = ["id"] + [c for c in columns if c != "id"]

    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow({k: "" if row.get(k) is None else row.get(k) for k in columns})
    filename = f"players-{datetime.now().strftime('%Y-%m-%d')}.csv"
    return StreamingResponse(
        iter([out.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/players/{player_id}")
async def get_player(player_id: str, admin: AdminIdentity = CurrentAdmin):
    try:
        oid = PydanticObjectId(player_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Player not found")
    doc = await Player.get_motor_collection().find_one({"_id": oid})
    if doc is None:
        raise HTTPException(status_code=404, detail="Player not found")
    payments = await Payment.get_motor_collection().find({"player_id": oid}).sort("created_at", -1).to_list(None)

    player = _jsonable(doc)
    player["id"] = player.pop("_id")
    player.pop("revision_id", None)
    return {
        "player": player,
        "payment": _payment_summary(payments),
        "payments": [
            {k: v for k, v in _jsonable(p).items() if k not in {"_id", "player_id", "revision_id"}}
            for p in payments
        ],
    }


# ---------- admins ----------


class AdminCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"[A-Za-z0-9._@-]+", value):
            raise ValueError("Use letters, numbers, dots, dashes, underscores or @ only")
        return value


@router.get("/admins")
async def list_admins(request: Request, admin: AdminIdentity = CurrentAdmin):
    settings = request.app.state.settings  # type: ignore[attr-defined]
    stored = await Admin.find_all().sort("+created_at").to_list()
    return {
        "admins": [
            {"username": settings.admin_username, "is_owner": True, "created_by": None, "created_at": None},
            *[
                {
                    "username": a.username,
                    "is_owner": False,
                    "created_by": a.created_by,
                    "created_at": _jsonable(a.created_at),
                }
                for a in stored
            ],
        ]
    }


@router.post("/admins", status_code=status.HTTP_201_CREATED)
async def create_admin(payload: AdminCreate, request: Request, admin: AdminIdentity = CurrentAdmin):
    settings = request.app.state.settings  # type: ignore[attr-defined]
    if payload.username.lower() == settings.admin_username.lower() or await Admin.find_one(
        {"username": {"$regex": f"^{re.escape(payload.username)}$", "$options": "i"}}
    ):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That username is already taken")
    new_admin = Admin(
        username=payload.username,
        password_hash=hash_password(payload.password),
        created_by=admin.username,
    )
    await new_admin.insert()
    return {"username": new_admin.username, "is_owner": False, "created_by": admin.username, "created_at": _jsonable(new_admin.created_at)}


@router.delete("/admins/{username}")
async def delete_admin(username: str, request: Request, admin: AdminIdentity = CurrentAdmin):
    settings = request.app.state.settings  # type: ignore[attr-defined]
    if username == settings.admin_username:
        raise HTTPException(status_code=400, detail="The owner admin comes from ADMIN_USERNAME and can't be removed here")
    if username == admin.username:
        raise HTTPException(status_code=400, detail="You can't remove yourself")
    target = await Admin.find_one(Admin.username == username)
    if target is None:
        raise HTTPException(status_code=404, detail="Admin not found")
    await target.delete()
    return {"deleted": username}
