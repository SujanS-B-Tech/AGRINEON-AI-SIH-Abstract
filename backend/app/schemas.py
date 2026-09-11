"""AGRONEON Pydantic Schemas — request/response validation for all API endpoints"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


# ─── Auth ───────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    preferred_language: str = "English"
    location: str
    land_area: float
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    previous_crop: Optional[str] = None
    current_season: str = "Kharif"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ─── Farm ───────────────────────────────────────────────
class FarmCreate(BaseModel):
    location: str
    land_area: float
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    previous_crop: Optional[str] = None
    current_season: str = "Kharif"
    current_crop: Optional[str] = None
    crop_stage: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FarmUpdate(BaseModel):
    location: Optional[str] = None
    land_area: Optional[float] = None
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    previous_crop: Optional[str] = None
    current_season: Optional[str] = None
    current_crop: Optional[str] = None
    crop_stage: Optional[str] = None


class FarmResponse(BaseModel):
    id: int
    user_id: int
    location: str
    land_area: float
    soil_type: Optional[str] = None
    water_availability: Optional[str] = None
    previous_crop: Optional[str] = None
    current_season: Optional[str] = None
    current_crop: Optional[str] = None
    crop_stage: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Soil ───────────────────────────────────────────────
class SoilParameterSchema(BaseModel):
    parameter_name: str
    value: Optional[float] = None
    unit: str = ""
    status: str = "Info"
    interpretation: str = ""


class SoilReportCreate(BaseModel):
    farm_id: int
    parameters: list[SoilParameterSchema]


class SoilReportResponse(BaseModel):
    id: int
    farm_id: int
    report_type: str
    uploaded_at: Optional[datetime] = None
    parameters: list[SoilParameterSchema] = []

    class Config:
        from_attributes = True


# ─── Crop ───────────────────────────────────────────────
class CropRecommendRequest(BaseModel):
    farm_id: int
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    water_availability: Optional[str] = None
    season: Optional[str] = None
    location: Optional[str] = None
    land_area: Optional[float] = None
    previous_crop: Optional[str] = None


class CropRecommendationResponse(BaseModel):
    id: int
    crop_name: str
    suitability_score: float
    explanation: Optional[list] = None
    seed_cost: Optional[float] = None
    fertilizer_cost: Optional[float] = None
    labour_cost: Optional[float] = None
    irrigation_cost: Optional[float] = None
    equipment_cost: Optional[float] = None
    other_cost: Optional[float] = None
    expected_yield: Optional[float] = None
    yield_unit: Optional[str] = None
    market_price: Optional[float] = None
    estimated_revenue: Optional[float] = None
    estimated_profit: Optional[float] = None
    risk_level: Optional[str] = None
    risk_factors: Optional[list] = None
    is_selected: bool = False

    class Config:
        from_attributes = True


class CropSelectRequest(BaseModel):
    farm_id: int
    recommendation_id: int


# ─── Crop Plan ──────────────────────────────────────────
class CropTaskResponse(BaseModel):
    id: int
    stage: str
    task_description: str
    scheduled_date: Optional[date] = None
    completed: bool = False
    completed_at: Optional[datetime] = None
    alert: Optional[str] = None

    class Config:
        from_attributes = True


class CropPlanResponse(BaseModel):
    id: int
    farm_id: int
    crop_name: str
    season: Optional[str] = None
    start_date: Optional[date] = None
    current_stage: Optional[str] = None
    tasks: list[CropTaskResponse] = []

    class Config:
        from_attributes = True


# ─── Disease ────────────────────────────────────────────
class DiseaseResponse(BaseModel):
    id: int
    disease_name: Optional[str] = None
    confidence: Optional[float] = None # Used for model_score
    confidence_level: Optional[str] = None
    severity: Optional[str] = None
    symptoms: Optional[list] = None
    prevention: Optional[list] = None
    next_steps: Optional[list] = None
    crop_protection: Optional[list] = None
    sources: Optional[list] = None
    image_path: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Market ─────────────────────────────────────────────
class MarketPriceSchema(BaseModel):
    crop_name: str
    price: float
    unit: str = "₹/quintal"
    grade: Optional[str] = None
    transport_cost: Optional[float] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MarketResponse(BaseModel):
    id: int
    name: str
    location: Optional[str] = None
    contact: Optional[str] = None
    prices: list[MarketPriceSchema] = []

    class Config:
        from_attributes = True


class MarketListingCreate(BaseModel):
    crop_name: str
    quantity: float
    expected_price: Optional[float] = None
    location: Optional[str] = None


class MarketListingResponse(BaseModel):
    id: int
    crop_name: str
    quantity: float
    expected_price: Optional[float] = None
    location: Optional[str] = None
    status: str = "active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Service ────────────────────────────────────────────
class ServiceResponse(BaseModel):
    id: int
    name: str
    service_type: str
    location: Optional[str] = None
    contact: Optional[str] = None
    website: Optional[str] = None

    class Config:
        from_attributes = True


class SchemeResponse(BaseModel):
    id: int
    name: str
    eligibility: Optional[str] = None
    benefit: Optional[str] = None
    farmer_category: Optional[str] = None
    application_info: Optional[str] = None
    official_source: Optional[str] = None

    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    id: int
    title: str
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    location: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Chat ───────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    language: str = "English"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    source: str = "system"


# ─── Notification ───────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: Optional[str] = None
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
