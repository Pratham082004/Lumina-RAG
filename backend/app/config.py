from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory of backend package
BASE_DIR = Path(__file__).resolve().parent.parent

# Explicitly load .env file into os.environ using python-dotenv
load_dotenv(BASE_DIR / ".env")


class Settings(BaseSettings):
    # ==========================================================
    # Application Configuration
    # ==========================================================
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    # ==========================================================
    # Server Configuration
    # ==========================================================
    HOST: str
    PORT: int

    # ==========================================================
    # Database Configuration (PostgreSQL)
    # ==========================================================
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    # ==========================================================
    # Redis Configuration
    # ==========================================================
    REDIS_HOST: str
    REDIS_PORT: int

    # ==========================================================
    # Storage Configuration
    # ==========================================================
    REPORT_STORAGE: str

    # ==========================================================
    # Ollama AI Configuration
    # ==========================================================
    EMBEDDING_PROVIDER: str
    LLM_PROVIDER: str
    OLLAMA_BASE_URL: str
    OLLAMA_EMBED_MODEL: str
    OLLAMA_LLM_MODEL: str

    # ==========================================================
    # Vector Store (ChromaDB)
    # ==========================================================
    VECTOR_DB: str
    CHROMA_PATH: str
    CHROMA_COLLECTION: str
    VECTOR_SIZE: int

    # ==========================================================
    # Auth & Email Configuration
    # ==========================================================
    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRES_MINUTES: int
    JWT_REFRESH_EXPIRES_DAYS: int
    GOOGLE_CLIENT_ID: Optional[str] = ""
    FRONTEND_URL: str

    EMAIL_HOST: str
    EMAIL_PORT: int
    EMAIL_USER: Optional[str] = ""
    EMAIL_PASS: Optional[str] = ""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://"
            f"{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()