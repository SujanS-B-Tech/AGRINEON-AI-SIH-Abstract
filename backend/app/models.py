"""AGRONEON SQLAlchemy ORM Models — all tables matching database/init.sql"""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, Date, DateTime,
    ForeignKey, JSON, Numeric, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20))
    password_hash = Column(String(255), nullable=False)
    preferred_language = Column(String(50), default="English")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    market_listings = relationship("MarketListing", back_populates="user", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(500), nullable=False)
    land_area = Column(Numeric(10, 2), nullable=False)
    soil_type = Column(String(100))
    water_availability = Column(String(50))
    previous_crop = Column(String(100))
    current_season = Column(String(50))
    current_crop = Column(String(100))
    crop_stage = Column(String(100))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="farms")
    soil_reports = relationship("SoilReport", back_populates="farm", cascade="all, delete-orphan")
    crop_recommendations = relationship("CropRecommendation", back_populates="farm", cascade="all, delete-orphan")
    crop_plans = relationship("CropPlan", back_populates="farm", cascade="all, delete-orphan")
    disease_predictions = relationship("DiseasePrediction", back_populates="farm", cascade="all, delete-orphan")


class SoilReport(Base):
    __tablename__ = "soil_reports"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String(50), default="manual")
    file_path = Column(String(500))
    uploaded_at = Column(DateTime, server_default=func.now())

    farm = relationship("Farm", back_populates="soil_reports")
    parameters = relationship("SoilParameter", back_populates="soil_report", cascade="all, delete-orphan")


class SoilParameter(Base):
    __tablename__ = "soil_parameters"
    id = Column(Integer, primary_key=True, index=True)
    soil_report_id = Column(Integer, ForeignKey("soil_reports.id", ondelete="CASCADE"), nullable=False)
    parameter_name = Column(String(100), nullable=False)
    value = Column(Numeric(10, 4))
    unit = Column(String(50))
    status = Column(String(50))
    interpretation = Column(Text)

    soil_report = relationship("SoilReport", back_populates="parameters")


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    suitability_score = Column(Numeric(5, 2), nullable=False)
    explanation = Column(JSON)
    is_selected = Column(Boolean, default=False)
    seed_cost = Column(Numeric(12, 2))
    fertilizer_cost = Column(Numeric(12, 2))
    labour_cost = Column(Numeric(12, 2))
    irrigation_cost = Column(Numeric(12, 2))
    equipment_cost = Column(Numeric(12, 2))
    other_cost = Column(Numeric(12, 2))
    expected_yield = Column(Numeric(10, 2))
    yield_unit = Column(String(50))
    market_price = Column(Numeric(10, 2))
    estimated_revenue = Column(Numeric(14, 2))
    estimated_profit = Column(Numeric(14, 2))
    risk_level = Column(String(20))
    risk_factors = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    farm = relationship("Farm", back_populates="crop_recommendations")


class CropPlan(Base):
    __tablename__ = "crop_plans"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    season = Column(String(50))
    start_date = Column(Date)
    current_stage = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    farm = relationship("Farm", back_populates="crop_plans")
    tasks = relationship("CropTask", back_populates="crop_plan", cascade="all, delete-orphan")


class CropTask(Base):
    __tablename__ = "crop_tasks"
    id = Column(Integer, primary_key=True, index=True)
    crop_plan_id = Column(Integer, ForeignKey("crop_plans.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String(100), nullable=False)
    task_description = Column(Text, nullable=False)
    scheduled_date = Column(Date)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    alert = Column(Text)

    crop_plan = relationship("CropPlan", back_populates="tasks")


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(500))
    disease_name = Column(String(255))
    confidence = Column(Numeric(5, 2)) # Used for raw model_score
    confidence_level = Column(String(50))
    severity = Column(String(50))
    symptoms = Column(JSON)
    prevention = Column(JSON)
    next_steps = Column(JSON)
    crop_protection = Column(JSON)
    sources = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    farm = relationship("Farm", back_populates="disease_predictions")


class Market(Base):
    __tablename__ = "markets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(500))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    contact = Column(String(100))
    is_demo = Column(Boolean, default=False)

    prices = relationship("MarketPrice", back_populates="market", cascade="all, delete-orphan")


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(50), default="₹/quintal")
    grade = Column(String(50))
    transport_cost = Column(Numeric(10, 2))
    updated_at = Column(DateTime, server_default=func.now())

    market = relationship("Market", back_populates="prices")


class MarketListing(Base):
    __tablename__ = "market_listings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    expected_price = Column(Numeric(10, 2))
    location = Column(String(500))
    status = Column(String(50), default="active")
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="market_listings")


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    service_type = Column(String(100), nullable=False)
    location = Column(String(500))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    contact = Column(String(100))
    website = Column(String(500))
    is_demo = Column(Boolean, default=False)


class GovernmentScheme(Base):
    __tablename__ = "government_schemes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    eligibility = Column(Text)
    benefit = Column(Text)
    farmer_category = Column(String(100))
    application_info = Column(Text)
    official_source = Column(String(500))
    is_demo = Column(Boolean, default=False)


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    event_type = Column(String(100))
    event_date = Column(Date)
    location = Column(String(500))
    source = Column(String(255))
    is_demo = Column(Boolean, default=False)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="notifications")
