from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.database.base import Base
from app.database.database import engine
from app.dependencies import get_company_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events.
    """

    # Run database migrations / ensure tables exist
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("Alembic database migrations applied successfully.")
    except Exception as exc:
        print(f"Alembic migration info: {exc}. Initializing tables via Base.metadata...")
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables initialized successfully via Base.metadata.")
        except Exception as table_exc:
            print(f"Failed to initialize database tables: {table_exc}")

    # Startup company cache
    cache = get_company_cache()

    try:
        await cache.load()
        print(
            f"Loaded {len(cache.company_records)} SEC companies."
        )
    except Exception as exc:
        print(f"Failed to load SEC company cache: {exc}")

    # Initialize Chroma vector store collection
    try:
        from app.services.vector_store.factory import get_vector_store
        vector_store = get_vector_store()
        await vector_store.create_collection()
        print("Vector store collection initialized successfully.")
    except Exception as exc:
        print(f"Failed to initialize vector store collection: {exc}")

    yield

    # Shutdown
    print("Lumina Finance API shutting down.")


app = FastAPI(
    title="Lumina Finance API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev, can restrict later
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