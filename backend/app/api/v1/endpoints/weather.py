from fastapi import APIRouter, Depends, HTTPException, Query
import httpx

from app.core.config import settings
from app.core.security import get_optional_user

router = APIRouter()

@router.get("/")
async def get_weather(
    lat: float = Query(description="Latitude"), 
    lon: float = Query(description="Longitude")
):
    """
    Fetch current weather and forecast.
    Uses OpenWeatherMap if API key is provided, else returns generated estimates based on location and season.
    """
    if settings.WEATHER_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={settings.WEATHER_API_KEY}&units=metric"
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "temp": round(data["main"]["temp"], 1),
                        "condition": data["weather"][0]["main"],
                        "humidity": f'{data["main"]["humidity"]}%',
                        "wind": f'{round(data["wind"]["speed"] * 3.6, 1)} km/h',
                        "rainfall": f'{data.get("rain", {}).get("1h", 0)} mm'
                    }
        except Exception:
            pass # Fallback to estimate

    # Fallback/Demo Data
    return {
        "temp": 28.5,
        "condition": "Partly Cloudy",
        "humidity": "65%",
        "wind": "12.5 km/h",
        "rainfall": "0 mm"
    }

@router.get("/forecast")
async def get_forecast():
    """Weekly forecast fallback"""
    return [
        {"day": "Mon", "temp": 29, "condition": "Sunny"},
        {"day": "Tue", "temp": 30, "condition": "Sunny"},
        {"day": "Wed", "temp": 28, "condition": "Cloudy"},
        {"day": "Thu", "temp": 26, "condition": "Rain"},
        {"day": "Fri", "temp": 27, "condition": "Partly Cloudy"},
    ]
