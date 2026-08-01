from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.dependencies import get_company_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events.
    """

    # Startup
    cache = get_company_cache()

    try:
        await cache.load()
        print(
            f"✅ Loaded {len(cache.company_records)} SEC companies."
        )
    except Exception as exc:
        print(f"❌ Failed to load SEC company cache: {exc}")
        raise

    yield

    # Shutdown
    print("👋 Lumina Finance API shutting down.")


app = FastAPI(
    title="Lumina Finance API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev, can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "Lumina Finance API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }