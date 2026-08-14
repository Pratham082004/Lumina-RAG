import os

# Set environment variables for testing before any application code is imported
# This prevents Pydantic BaseSettings from throwing validation errors during pytest collection
os.environ.setdefault("APP_VERSION", "0.0.0")
os.environ.setdefault("APP_NAME", "Lumina-RAG")
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("HOST", "127.0.0.1")
os.environ.setdefault("PORT", "8000")
os.environ.setdefault("DB_HOST", "127.0.0.1")
os.environ.setdefault("DB_PORT", "5432")
os.environ.setdefault("DB_NAME", "test_db")
os.environ.setdefault("DB_USER", "test_user")
os.environ.setdefault("DB_PASSWORD", "test_password")
os.environ.setdefault("REDIS_HOST", "127.0.0.1")
os.environ.setdefault("REDIS_PORT", "6379")
os.environ.setdefault("REPORT_STORAGE", "storage/reports")
os.environ.setdefault("GEMINI_API_KEY", "mock_key")
