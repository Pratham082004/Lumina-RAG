from fastapi import APIRouter

from app.api.chats import router as chat_router
from app.api.ingest import router as ingest_router
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.user import router as user_router
from app.api.history import router as history_router
from app.api.stocks import router as stocks_router

api_router = APIRouter()

api_router.include_router(
    health_router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    ingest_router,
    prefix="/ingest",
    tags=["Ingestion"],
)

api_router.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"],
)

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"],
)

api_router.include_router(
    user_router,
    prefix="",
    tags=["User"],
)

api_router.include_router(
    history_router,
    prefix="/history",
    tags=["History"],
)

api_router.include_router(
    stocks_router,
    prefix="/stocks",
    tags=["Stocks"],
)