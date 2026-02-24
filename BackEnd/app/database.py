from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from app.db.base import Base
from fastapi import Request

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Request is optional because seeds might use it without request
def get_db(request: Request = None):
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
