"""Admin authentication for the /api/admin-panel routes (the standalone apps/admin panel).

Two kinds of admin can sign in:
- the "owner" from ADMIN_USERNAME / ADMIN_PASSWORD (always works, cannot be removed), and
- admins stored in the `admins` collection, added from the admin panel.

Sessions are HS256 JWTs signed with ADMIN_JWT_SECRET. Each token also carries a stamp derived from
the signer's current password, so changing a password (or removing and re-adding an admin) signs
out every token issued before.
"""

import asyncio
import hashlib
import hmac
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status

from app.core.config import Settings
from app.models.admin import Admin

TOKEN_TTL_SECONDS = 12 * 60 * 60
MIN_JWT_SECRET_LENGTH = 32
_ALGORITHM = "HS256"

# Sign-in throttle: attempts are counted per client IP and per username in a sliding window.
# In memory, so each backend process keeps its own counts.
LOGIN_WINDOW_SECONDS = 15 * 60
MAX_ATTEMPTS_PER_USERNAME = 10
MAX_ATTEMPTS_PER_IP = 50
_MAX_TRACKED_KEYS = 10_000
_attempts: dict[str, deque[float]] = defaultdict(deque)


@dataclass
class AdminIdentity:
    username: str
    is_owner: bool
    # Ties a token to the password it was issued for; never sent to clients.
    stamp: str = field(default="", repr=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _check_hash(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


_dummy_hash: str | None = None


def _check_against_dummy(password: str) -> None:
    """Spend the same time as a real check, so response time doesn't reveal which usernames exist."""
    global _dummy_hash
    if _dummy_hash is None:
        _dummy_hash = hash_password("not-a-real-password")
    _check_hash(password, _dummy_hash)


def _same(a: str, b: str) -> bool:
    # compare_digest raises TypeError for non-ASCII str, so compare the UTF-8 bytes.
    return hmac.compare_digest(a.encode(), b.encode())


def _signing_key(settings: Settings) -> str:
    secret = settings.admin_jwt_secret
    if not secret or len(secret) < MIN_JWT_SECRET_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Admin panel sign-in isn't set up: set ADMIN_JWT_SECRET "
                f"(at least {MIN_JWT_SECRET_LENGTH} random characters) on the backend"
            ),
        )
    return secret


def _stamp(settings: Settings, credential: str) -> str:
    """Changes whenever `credential` (the owner password, or an admin's password hash) does."""
    key = _signing_key(settings).encode()
    return hmac.new(key, b"credential:" + credential.encode(), hashlib.sha256).hexdigest()[:32]


# ---------- sign-in throttle ----------


def _live_attempts(key: str, now: float) -> deque[float] | None:
    attempts = _attempts.get(key)
    if attempts is None:
        return None
    while attempts and now - attempts[0] > LOGIN_WINDOW_SECONDS:
        attempts.popleft()
    if not attempts:
        del _attempts[key]
        return None
    return attempts


def _throttle_keys(ip: str, username: str) -> tuple[str, str]:
    return f"ip:{ip}", f"user:{username.strip().lower()[:64]}"


def start_login_attempt(ip: str, username: str) -> float:
    """Count a sign-in attempt, or raise 429 if this IP or username has made too many lately.

    The attempt is counted before the password is checked, so a burst of parallel guesses can't
    slip past the limit. Call `finish_login_attempt` on success to give the attempt back.
    """
    now = time.monotonic()
    ip_key, user_key = _throttle_keys(ip, username)
    for key, limit in ((ip_key, MAX_ATTEMPTS_PER_IP), (user_key, MAX_ATTEMPTS_PER_USERNAME)):
        attempts = _live_attempts(key, now)
        if attempts is not None and len(attempts) >= limit:
            retry_after = max(1, int(LOGIN_WINDOW_SECONDS - (now - attempts[0])) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many sign-in attempts. Wait a few minutes and try again.",
                headers={"Retry-After": str(retry_after)},
            )
    if len(_attempts) > _MAX_TRACKED_KEYS:
        for key in list(_attempts):
            _live_attempts(key, now)
    _attempts[ip_key].append(now)
    _attempts[user_key].append(now)
    return now


def finish_login_attempt(ip: str, username: str, started: float) -> None:
    """A successful sign-in: forget this username's earlier typos and don't count this attempt against the IP."""
    ip_key, user_key = _throttle_keys(ip, username)
    _attempts.pop(user_key, None)
    attempts = _attempts.get(ip_key)
    if attempts is not None:
        try:
            attempts.remove(started)
        except ValueError:
            pass
        if not attempts:
            del _attempts[ip_key]


# ---------- sign-in and sessions ----------


async def authenticate(username: str, password: str, settings: Settings) -> AdminIdentity | None:
    _signing_key(settings)  # fail fast (503) when the panel isn't configured, before checking anything
    username = username.strip()
    if _same(username, settings.admin_username) and _same(password, settings.admin_password):
        return AdminIdentity(
            username=settings.admin_username,
            is_owner=True,
            stamp=_stamp(settings, settings.admin_password),
        )
    admin = await Admin.find_one(Admin.username == username)
    # bcrypt is slow and CPU-bound: keep it off the event loop so sign-in attempts can't stall other requests.
    if admin is None:
        await asyncio.to_thread(_check_against_dummy, password)
        return None
    if await asyncio.to_thread(_check_hash, password, admin.password_hash):
        return AdminIdentity(username=admin.username, is_owner=False, stamp=_stamp(settings, admin.password_hash))
    return None


def issue_token(identity: AdminIdentity, settings: Settings) -> str:
    now = int(time.time())
    payload = {
        "sub": identity.username,
        "owner": identity.is_owner,
        "pv": identity.stamp,
        "iat": now,
        "exp": now + TOKEN_TTL_SECONDS,
    }
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
        payload = jwt.decode(
            token,
            _signing_key(settings),
            algorithms=[_ALGORITHM],
            options={"require": ["exp", "sub", "pv"]},
        )
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Session expired, sign in again")
    except jwt.PyJWTError:
        raise _unauthorized("Invalid session, sign in again")

    username = payload.get("sub")
    stamp = payload.get("pv")
    if not isinstance(username, str) or not isinstance(stamp, str):
        raise _unauthorized("Invalid session, sign in again")

    if payload.get("owner"):
        # Changing ADMIN_USERNAME or ADMIN_PASSWORD signs the owner out.
        if not _same(username, settings.admin_username) or not _same(stamp, _stamp(settings, settings.admin_password)):
            raise _unauthorized("Invalid session, sign in again")
        return AdminIdentity(username=username, is_owner=True)

    # A removed admin loses access straight away, even with an unexpired token.
    admin = await Admin.find_one(Admin.username == username)
    if admin is None:
        raise _unauthorized("This admin no longer exists")
    if not _same(stamp, _stamp(settings, admin.password_hash)):
        raise _unauthorized("Invalid session, sign in again")
    return AdminIdentity(username=username, is_owner=False)


CurrentAdmin = Depends(require_admin)
