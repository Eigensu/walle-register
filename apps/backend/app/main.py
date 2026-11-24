import asyncio
from contextlib import asynccontextmanager, suppress
from pathlib import Path

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.models.payment import Payment
from app.models.player import Player
from app.models.admin import Admin
from app.models.config import AppConfig
from app.routers import payments, registration, admin, admin_panel
from app.routers.payments import run_cashfree_reconciler
from app.services.cashfree import CashfreeService
from app.services.razorpay import RazorpayService
from app.services.storage import build_storage_service

settings = get_settings()
UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"


@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(settings.mongo_url)
    database = client[settings.mongo_db]
    await init_beanie(database=database, document_models=[Player, Payment, AppConfig, Admin])

    storage = build_storage_service(
        settings.storage_mode, 
        UPLOADS_DIR, 
        base_url="/uploads",
        cloudinary_cloud_name=settings.cloudinary_cloud_name,
        cloudinary_api_key=settings.cloudinary_api_key,
        cloudinary_api_secret=settings.cloudinary_api_secret,
        cloudinary_folder=settings.cloudinary_folder
    )
    # A gateway client is built whenever its keys are present, even if it is not in
    # PAYMENT_GATEWAYS, so payments started before it was switched off can still be
    # verified and their webhooks processed. PAYMENT_GATEWAYS only controls new payments.
    razorpay = (
        RazorpayService(settings.razorpay_key_id, settings.razorpay_key_secret)
        if settings.razorpay_key_id and settings.razorpay_key_secret
        else None
    )
    cashfree = (
        CashfreeService(
            settings.cashfree_app_id,
            settings.cashfree_secret_key,
            env=settings.cashfree_env,
            api_version=settings.cashfree_api_version,
        )
        if settings.cashfree_app_id and settings.cashfree_secret_key
        else None
    )

    app.state.storage = storage
    app.state.settings = settings
    app.state.razorpay = razorpay
    app.state.cashfree = cashfree
    # Ensure default app config exists
    cfg = await AppConfig.find_one({})
    if cfg is None:
        cfg = AppConfig(registration_open=True)
        await cfg.insert()

    # Confirms paid Cashfree orders that neither the player's browser nor the webhook reported.
    reconciler = (
        asyncio.create_task(
            run_cashfree_reconciler(cashfree, settings.cashfree_reconcile_interval_seconds),
            name="cashfree-reconciler",
        )
        if cashfree and settings.cashfree_reconcile_interval_seconds > 0
        else None
    )

    yield

    if reconciler:
        reconciler.cancel()
        with suppress(asyncio.CancelledError):
            await reconciler
    if razorpay:
        await razorpay.aclose()
    if cashfree:
        await cashfree.aclose()
    client.close()


app = FastAPI(title="Walle Registration", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(registration.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(admin_panel.router)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
