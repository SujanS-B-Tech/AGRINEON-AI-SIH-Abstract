from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Service, GovernmentScheme, Event
from app.schemas import ServiceResponse, SchemeResponse, EventResponse

router = APIRouter()

@router.get("/nearby", response_model=List[ServiceResponse])
def get_nearby_services(db: Session = Depends(get_db)):
    # In a real app, you would use PostGIS or Haversine to filter by location
    return db.query(Service).all()

@router.get("/schemes", response_model=List[SchemeResponse])
def get_schemes(db: Session = Depends(get_db)):
    return db.query(GovernmentScheme).all()

@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db)):
    from datetime import date
    return db.query(Event).filter(Event.event_date >= date.today()).order_by(Event.event_date).all()
