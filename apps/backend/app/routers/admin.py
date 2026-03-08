from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from app.core.config import Settings
from app.models.player import Player, RegistrationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.config import AppConfig
from beanie.operators import In

router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    success: bool
    message: str


class PlayerResponse(BaseModel):
    id: str
    # Personal Details
    first_name: str
    last_name: str
    email: str
    phone: str
    residential_area: str
    firm_name: str
    designation: str
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
    JMCL_S2_team: str
    # Registration & Payment
    registration_status: str
    payment_status: str | None
    created_at: str | None


async def get_settings(request: Request) -> Settings:
    return request.app.state.settings  # type: ignore[attr-defined]


def verify_admin_credentials(username: str, password: str, settings: Settings) -> bool:
    """Verify admin credentials against environment variables."""
    return (
        username == settings.admin_username
        and password == settings.admin_password
    )


@router.post("/login")
async def admin_login(
    payload: AdminLoginRequest,
    settings: Settings = Depends(get_settings),
):
    """Authenticate admin user."""
    if verify_admin_credentials(payload.username, payload.password, settings):
        return AdminLoginResponse(
            success=True,
            message="Login successful"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.get("/players")
async def get_all_players(
    username: str,
    password: str,
    page: int = 1,
    limit: int = 50,
    settings: Settings = Depends(get_settings),
):
    """Get registered players with pagination (requires authentication)."""
    if not verify_admin_credentials(username, password, settings):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Use pagination
    skip = (page - 1) * limit

    players_collection = Player.get_motor_collection()
    payments_collection = Payment.get_motor_collection()

    total = await players_collection.count_documents({})
    total_paid = await players_collection.count_documents({"registration_status": "PAID"})

    players_docs = await players_collection.find({}).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    player_ids = [doc.get("_id") for doc in players_docs if doc.get("_id")]

    payments_docs = []
    if player_ids:
        payments_docs = await payments_collection.find({"player_id": {"$in": player_ids}}).to_list(None)

    payment_map = {doc.get("player_id"): doc for doc in payments_docs if doc.get("player_id")}

    result = []
    for doc in players_docs:
        player_id = doc.get("_id")
        payment_doc = payment_map.get(player_id)

        raw_registration_status = doc.get("registration_status")
        registration_status = (
            raw_registration_status
            if raw_registration_status in {status.value for status in RegistrationStatus}
            else "UNKNOWN"
        )

        raw_payment_status = payment_doc.get("status") if payment_doc else None
        payment_status = (
            raw_payment_status
            if raw_payment_status in {status.value for status in PaymentStatus}
            else None
        )

        created_at = doc.get("created_at")
        result.append(
            PlayerResponse(
                id=str(player_id) if player_id else "",
                first_name=doc.get("first_name", ""),
                last_name=doc.get("last_name", ""),
                email=doc.get("email", ""),
                phone=doc.get("phone", ""),
                residential_area=doc.get("residential_area", ""),
                firm_name=doc.get("firm_name", ""),
                designation=doc.get("designation", ""),
                batting_type=doc.get("batting_type", ""),
                bowling_type=doc.get("bowling_type", ""),
                wicket_keeper=doc.get("wicket_keeper", ""),
                name_on_jersey=doc.get("name_on_jersey", ""),
                tshirt_size=doc.get("tshirt_size", ""),
                waist_size=doc.get("waist_size", 0),
                played_JMCL_S2=doc.get("played_JMCL_S2", ""),
                JMCL_S2_team=doc.get("JMCL_S2_team", ""),
                registration_status=registration_status,
                payment_status=payment_status,
                created_at=created_at.isoformat() if created_at else None,
            )
        )
    
    return {
        "players": result,
        "total": total,
        "total_paid": total_paid,
        "page": page,
        "limit": limit
    }


@router.get("/players/csv")
async def export_players_csv(
    username: str,
    password: str,
    settings: Settings = Depends(get_settings),
):
    """Export all players as CSV for Google Sheets import."""
    if not verify_admin_credentials(username, password, settings):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    import csv
    import io
    from fastapi.responses import StreamingResponse

    players_collection = Player.get_motor_collection()
    payments_collection = Payment.get_motor_collection()

    players = await players_collection.find({}).to_list(None)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Residential Area",
        "Firm/Company",
        "Designation",
        "Aadhar Number",
        "City",
        "Village",
        "Batting Type",
        "Bowling Type",
        "Wicket Keeper",
        "Name on Jersey",
        "T-Shirt Size",
        "Waist Size",
        "Played JMCL S1",
        "JMCL S1 Team",
        "Registration Status",
        "Payment Status",
        "Created At",
        "Photo URL"
    ])
    
    # Optimize N+1 query for CSV export as well
    player_ids = [player.get("_id") for player in players if player.get("_id")]
    payments_docs = []
    if player_ids:
        payments_docs = await payments_collection.find({"player_id": {"$in": player_ids}}).to_list(None)
    payment_map = {payment.get("player_id"): payment for payment in payments_docs if payment.get("player_id")}

    # Write player data
    for player in players:
        payment = payment_map.get(player.get("_id"))
        raw_registration_status = player.get("registration_status")
        registration_status = (
            raw_registration_status
            if raw_registration_status in {status.value for status in RegistrationStatus}
            else "UNKNOWN"
        )
        raw_payment_status = payment.get("status") if payment else None
        payment_status = (
            raw_payment_status
            if raw_payment_status in {status.value for status in PaymentStatus}
            else "N/A"
        )

        created_at = player.get("created_at")

        writer.writerow([
            str(player.get("_id", "")),
            player.get("first_name", ""),
            player.get("last_name", ""),
            player.get("email", ""),
            player.get("phone", ""),
            player.get("residential_area", ""),
            player.get("firm_name", ""),
            player.get("designation", ""),
            player.get("aadhar_number", ""),
            player.get("city", ""),
            player.get("village", ""),
            player.get("batting_type", ""),
            player.get("bowling_type", ""),
            player.get("wicket_keeper", ""),
            player.get("name_on_jersey", ""),
            player.get("tshirt_size", ""),
            player.get("waist_size", ""),
            player.get("played_JMCL_S2", ""),
            player.get("JMCL_S2_team", ""),
            registration_status,
            payment_status,
            created_at.isoformat() if created_at else "",
            player.get("photo_url", "")
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=players.csv"}
    )


class ConfigResponse(BaseModel):
    registration_open: bool


class ConfigUpdateRequest(BaseModel):
    registration_open: bool


@router.get("/config", response_model=ConfigResponse)
async def get_config(
    username: str,
    password: str,
    settings: Settings = Depends(get_settings),
):
    """Get application configuration (requires authentication)."""
    if not verify_admin_credentials(username, password, settings):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    cfg = await AppConfig.find_one({})
    if cfg is None:
        cfg = AppConfig(registration_open=True)
        await cfg.insert()
    return ConfigResponse(registration_open=cfg.registration_open)


@router.post("/config", response_model=ConfigResponse)
async def update_config(
    payload: ConfigUpdateRequest,
    username: str,
    password: str,
    settings: Settings = Depends(get_settings),
):
    """Update application configuration (requires authentication)."""
    if not verify_admin_credentials(username, password, settings):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    cfg = await AppConfig.find_one({})
    if cfg is None:
        cfg = AppConfig(registration_open=payload.registration_open)
        await cfg.insert()
    else:
        cfg.registration_open = payload.registration_open
        await cfg.save()
    return ConfigResponse(registration_open=cfg.registration_open)
