from sqlalchemy.orm import sessionmaker

from app.database.database import engine  # adjust import if your engine file is elsewhere

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()