from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================================================
    # Application
    # ==========================================================
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    # ==========================================================
    # Server
    # ==========================================================
    HOST: str
    PORT: int

    # ==========================================================
    # PostgreSQL
    # ==========================================================
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    # ==========================================================
    # Redis
    # ==========================================================
    REDIS_HOST: str
    REDIS_PORT: int

    # ==========================================================
    # Storage
    # ==========================================================
    REPORT_STORAGE: str

    # ==========================================================
    # Gemini
    # ==========================================================
    EMBEDDING_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ==========================================================
    # Vector Store (ChromaDB)
    # ==========================================================
    VECTOR_DB: str = "chroma"
    CHROMA_PATH: str = "./storage/chroma"
    CHROMA_COLLECTION: str = "financial_rag"
    VECTOR_SIZE: int = 3072

    # ==========================================================
    # Auth & Email
    # ==========================================================
    JWT_ACCESS_SECRET: str = "super_secret_access_key"
    JWT_REFRESH_SECRET: str = "super_secret_refresh_key"
    JWT_ACCESS_EXPIRES_MINUTES: int = 15
    JWT_REFRESH_EXPIRES_DAYS: int = 7
    GOOGLE_CLIENT_ID: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USER: str = ""
    EMAIL_PASS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
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