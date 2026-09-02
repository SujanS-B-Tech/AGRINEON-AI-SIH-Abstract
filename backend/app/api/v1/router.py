from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.endpoints import (
    auth, farms, soil, crop, disease, weather, markets, services, chat, notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(soil.router, prefix="/soil", tags=["soil"])
api_router.include_router(crop.router, prefix="/crop", tags=["crop"])
api_router.include_router(disease.router, prefix="/disease", tags=["disease"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
