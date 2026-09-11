from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

engine_kwargs = {"pool_pre_ping": True}
if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables from ORM models (safe if they already exist)."""
    from app.models import (
        User, Farm, SoilReport, SoilParameter, CropRecommendation,
        CropPlan, CropTask, DiseasePrediction, Market, MarketPrice,
        MarketListing, Service, GovernmentScheme, Event, Notification,
    )
    Base.metadata.create_all(bind=engine)
