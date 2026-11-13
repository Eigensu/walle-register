"""Admin authentication shared by the legacy /api/admin routes and the /api/admin-panel routes.

Two kinds of admin can sign in:
- the "owner" from ADMIN_USERNAME / ADMIN_PASSWORD (always works, cannot be removed), and
- admins stored in the `admins` collection, added from the admin panel.
"""

import hashlib
import hmac
import time
from dataclasses import dataclass

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings
from app.models.admin import Admin

TOKEN_TTL_SECONDS = 12 * 60 * 60
_ALGORITHM = "HS256"


@dataclass
class AdminIdentity:
    username: str
    is_owner: bool


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _check_hash(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


def _signing_key(settings: Settings) -> str:
    # ADMIN_JWT_SECRET if set; otherwise derived from the owner password, so changing that
    # password also signs everyone out.
    if settings.admin_jwt_secret:
        return settings.admin_jwt_secret
    return hashlib.sha256(f"admin-panel:{settings.mongo_db}:{settings.admin_password}".encode()).hexdigest()


async def authenticate(username: str, password: str, settings: Settings) -> AdminIdentity | None:
    username = username.strip()
    if hmac.compare_digest(username, settings.admin_username) and hmac.compare_digest(
        password, settings.admin_password
    ):
        return AdminIdentity(username=settings.admin_username, is_owner=True)
    admin = await Admin.find_one(Admin.username == username)
    if admin and _check_hash(password, admin.password_hash):
        return AdminIdentity(username=admin.username, is_owner=False)
    return None


def issue_token(identity: AdminIdentity, settings: Settings) -> str:
    now = int(time.time())
    payload = {"sub": identity.username, "owner": identity.is_owner, "iat": now, "exp": now + TOKEN_TTL_SECONDS}
    return jwt.encode(payload, _signing_key(settings), algorithm=_ALGORITHM)


def _unauthorized(detail: str = "Not signed in") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def require_admin(request: Request) -> AdminIdentity:
    settings: Settings = request.app.state.settings  # type: ignore[attr-defined]
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _unauthorized()
    try:
        payload = jwt.decode(token, _signing_key(settings), algorithms=[_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Session expired, sign in again")
    except jwt.PyJWTError:
        raise _unauthorized("Invalid session, sign in again")

    username = payload.get("sub")
    if payload.get("owner"):
        if username != settings.admin_username:
            raise _unauthorized("Invalid session, sign in again")
        return AdminIdentity(username=username, is_owner=True)
    # A removed admin loses access straight away, even with an unexpired token.
    if not username or not await Admin.find_one(Admin.username == username):
        raise _unauthorized("This admin no longer exists")
    return AdminIdentity(username=username, is_owner=False)


CurrentAdmin = Depends(require_admin)
