import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, EmailStr
from pymongo.errors import DuplicateKeyError

from app.models.player import BowlingType, Player, RegistrationStatus, TshirtSize
from app.models.config import AppConfig
from app.services.storage import StorageService

GSTIN_PATTERN = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")


def _clean_gstin(value: str | None) -> str:
    """Normalise an optional GSTIN (blank is fine) and reject one that can't be valid, since it is
    printed on the player's tax invoice."""
    gstin = "".join((value or "").split()).upper()
    if gstin and not GSTIN_PATTERN.match(gstin):
        raise HTTPException(status_code=422, detail="Enter a valid 15-character GST number, or leave it blank.")
    return gstin


def _clean_jersey_number(value: str | None) -> int | None:
    text = (value or "").strip()
    if not text:
        return None
    if not text.isdigit() or int(text) > 99:
        raise HTTPException(status_code=422, detail="Jersey number must be between 0 and 99.")
    return int(text)


router = APIRouter(prefix="/api", tags=["registration"])

MAX_FILE_BYTES = 10 * 1024 * 1024
PHOTO_MIMES = {"image/jpeg", "image/png", "image/heic", "image/heif"}


class RegisterResponse(BaseModel):
    player_id: str
    message: str = "Details Saved"


class ResumePaymentResponse(BaseModel):
    player_id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    registration_status: str
    message: str


class ResumePaymentRequest(BaseModel):
    email: EmailStr


class PlayerDetailsResponse(BaseModel):
    player_id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    residential_area: str
    firm_name: str
    gst_number: str = ""
    designation: str
    photo_url: str
    aadhar_number: str
    city: str
    village: str = ""
    batting_type: str
    bowling_type: str
    wicket_keeper: str
    name_on_jersey: str
    jersey_number: int | None = None
    tshirt_size: str
    waist_size: int
    played_JMCL_S2: str
    JMCL_S2_team: str
    registration_status: str


async def get_storage(request: Request) -> StorageService:
    return request.app.state.storage  # type: ignore[attr-defined]


@router.post("/register", response_model=RegisterResponse)
async def register_player(
    # Personal Details
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: EmailStr = Form(...),
    phone: str = Form(...),
    residential_area: str = Form(...),
    firm_name: str = Form(...),
    gst_number: str | None = Form(default=None),
    designation: str = Form(...),
    aadhar_number: str = Form(...),
    city: str = Form(...),
    village: str = Form(""),
    photo: UploadFile = File(...),
    # Cricket Details
    batting_type: str = Form(...),
    bowling_type: BowlingType = Form(...),
    wicket_keeper: str = Form(...),
    # Jersey Details
    name_on_jersey: str = Form(...),
    jersey_number: str | None = Form(default=None),
    tshirt_size: TshirtSize = Form(...),
    waist_size: int = Form(...),
    # JMCL Season 1 Details
    played_JMCL_S2: str = Form(...),
    JMCL_S2_team: str = Form(default=""),
    storage: StorageService = Depends(get_storage),
):
    # Check registration status
    cfg = await AppConfig.find_one({})
    if cfg and not cfg.registration_open:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Registration is currently closed")

    # Basic phone validation: require at least 10 digits (ignoring formatting)
    digit_only_phone = "".join(ch for ch in phone if ch.isdigit())
    if len(digit_only_phone) < 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Phone must have at least 10 digits")

    # Aadhaar validation: exactly 12 digits
    digit_only_aadhar = "".join(ch for ch in aadhar_number if ch.isdigit())
    if len(digit_only_aadhar) != 12:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Aadhaar must be exactly 12 digits")

    # Duplicate checks - do these before cap check to avoid confusion
    if await Player.find_one(Player.email == email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if await Player.find_one(Player.phone == phone):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already registered")

    # Check registration cap
    registration_cap = cfg.registration_cap if cfg else 174
    current_count = await Player.count()
    if current_count >= registration_cap:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Registration has reached maximum capacity of {registration_cap} players"
        )

    photo_url = await storage.save_upload(photo, PHOTO_MIMES, MAX_FILE_BYTES)

    player = Player(
        # Personal Details
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        residential_area=residential_area,
        firm_name=firm_name,
        gst_number=_clean_gstin(gst_number),
        designation=designation,
        photo_url=photo_url,
        aadhar_number=digit_only_aadhar,
        city=city,
        village=village,
        # Cricket Details
        batting_type=batting_type,
        bowling_type=bowling_type.value,
        wicket_keeper=wicket_keeper,
        # Jersey Details
        name_on_jersey=name_on_jersey,
        jersey_number=_clean_jersey_number(jersey_number),
        tshirt_size=tshirt_size.value,
        waist_size=waist_size,
        # JMCL Season 1 Details
        played_JMCL_S2=played_JMCL_S2,
        JMCL_S2_team=JMCL_S2_team,
        registration_status=RegistrationStatus.PENDING_PAYMENT,
        created_at=datetime.now(timezone.utc),
    )

    try:
        await player.insert()
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate email or phone") from exc

    return RegisterResponse(player_id=str(player.id), message="Details Saved")


@router.put("/player/{player_id}", response_model=RegisterResponse)
async def update_player(
    player_id: str,
    # Personal Details
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: EmailStr = Form(...),
    phone: str = Form(...),
    residential_area: str = Form(...),
    firm_name: str = Form(...),
    gst_number: str | None = Form(default=None),
    designation: str = Form(...),
    aadhar_number: str = Form(...),
    city: str = Form(...),
    village: str | None = Form(None),
    photo: UploadFile = File(None),
    # Cricket Details
    batting_type: str = Form(...),
    bowling_type: BowlingType = Form(...),
    wicket_keeper: str = Form(...),
    # Jersey Details
    name_on_jersey: str = Form(...),
    jersey_number: str | None = Form(default=None),
    tshirt_size: TshirtSize = Form(...),
    waist_size: int = Form(...),
    # JMCL Season 1 Details
    played_JMCL_S2: str = Form(...),
    JMCL_S2_team: str = Form(default=""),
    storage: StorageService = Depends(get_storage),
):
    """Update existing player details"""
    try:
        from beanie import PydanticObjectId
        player = await Player.get(PydanticObjectId(player_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    # Basic phone validation
    digit_only_phone = "".join(ch for ch in phone if ch.isdigit())
    if len(digit_only_phone) < 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Phone must have at least 10 digits")

    # Aadhaar validation: exactly 12 digits
    digit_only_aadhar = "".join(ch for ch in aadhar_number if ch.isdigit())
    if len(digit_only_aadhar) != 12:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Aadhaar must be exactly 12 digits")

    # Check for duplicate email/phone (excluding current player)
    if email != player.email:
        if await Player.find_one(Player.email == email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if phone != player.phone:
        if await Player.find_one(Player.phone == phone):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already registered")

    # Update fields
    player.first_name = first_name
    player.last_name = last_name
    player.email = email
    player.phone = phone
    player.residential_area = residential_area
    player.firm_name = firm_name
    # Older clients omit this optional field; preserve any stored value in that case.
    if gst_number is not None:
        player.gst_number = _clean_gstin(gst_number)
    player.designation = designation
    player.aadhar_number = digit_only_aadhar
    player.city = city
    # The form no longer collects this; keep any value already stored.
    if village is not None:
        player.village = village
    player.batting_type = batting_type
    player.bowling_type = bowling_type.value
    player.wicket_keeper = wicket_keeper
    player.name_on_jersey = name_on_jersey
    if jersey_number is not None:
        player.jersey_number = _clean_jersey_number(jersey_number)
    player.tshirt_size = tshirt_size.value
    player.waist_size = waist_size
    player.played_JMCL_S2 = played_JMCL_S2
    player.JMCL_S2_team = JMCL_S2_team

    # Update photo only if a new one is provided
    if photo and photo.filename:
        player.photo_url = await storage.save_upload(photo, PHOTO_MIMES, MAX_FILE_BYTES)

    await player.save()
    return RegisterResponse(player_id=str(player.id), message="Details Updated")


@router.post("/resume-payment", response_model=ResumePaymentResponse)
async def resume_payment(request: ResumePaymentRequest):
    """Check if a player with pending payment exists and return their details"""
    player = await Player.find_one(Player.email == request.email)

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found with this email"
        )

    if player.registration_status == RegistrationStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed for this email"
        )

    return ResumePaymentResponse(
        player_id=str(player.id),
        email=player.email,
        first_name=player.first_name,
        last_name=player.last_name,
        phone=player.phone,
        registration_status=player.registration_status.value,
        message="Resume payment available"
    )


@router.get("/player/{player_id}", response_model=PlayerDetailsResponse)
async def get_player_details(player_id: str):
    """Get player details by ID for resume/edit functionality"""
    try:
        from beanie import PydanticObjectId
        player = await Player.get(PydanticObjectId(player_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    return PlayerDetailsResponse(
        player_id=str(player.id),
        first_name=player.first_name,
        last_name=player.last_name,
        email=player.email,
        phone=player.phone,
        residential_area=player.residential_area,
        firm_name=player.firm_name,
        gst_number=getattr(player, "gst_number", "") or "",
        designation=player.designation,
        photo_url=player.photo_url,
        aadhar_number=player.aadhar_number,
        city=player.city,
        village=player.village,
        batting_type=player.batting_type,
        bowling_type=player.bowling_type,
        wicket_keeper=player.wicket_keeper,
        name_on_jersey=player.name_on_jersey,
        jersey_number=getattr(player, "jersey_number", None),
        tshirt_size=player.tshirt_size,
        waist_size=player.waist_size,
        played_JMCL_S2=player.played_JMCL_S2,
        JMCL_S2_team=player.JMCL_S2_team,
        registration_status=player.registration_status.value,
    )


class PublicConfigResponse(BaseModel):
    registration_open: bool
    registration_cap_reached: bool
    current_registrations: int
    registration_cap: int
    payment_gateways: list[str]


@router.get("/config", response_model=PublicConfigResponse)
async def get_public_config(request: Request):
    """Public endpoint: expose registration open/closed status for frontend."""
    cfg = await AppConfig.find_one({})
    registration_cap = cfg.registration_cap if cfg else 174
    current_count = await Player.count()

    return PublicConfigResponse(
        registration_open=cfg.registration_open if cfg else True,
        registration_cap_reached=current_count >= registration_cap,
        current_registrations=current_count,
        registration_cap=registration_cap,
        payment_gateways=request.app.state.settings.payment_gateways,  # type: ignore[attr-defined]
    )
