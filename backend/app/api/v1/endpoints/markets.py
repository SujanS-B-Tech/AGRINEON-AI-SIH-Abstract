from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Market, MarketPrice, MarketListing
from app.schemas import MarketResponse, MarketListingCreate, MarketListingResponse

router = APIRouter()

@router.get("/", response_model=List[MarketResponse])
def get_markets(db: Session = Depends(get_db)):
    markets = db.query(Market).all()
    return markets

@router.get("/compare", response_model=List[MarketResponse])
def compare_markets(crop_name: str, db: Session = Depends(get_db)):
    markets = db.query(Market).join(MarketPrice).filter(
        MarketPrice.crop_name.ilike(f"%{crop_name}%")
    ).all()
    return markets

@router.post("/listing", response_model=MarketListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: MarketListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_listing = MarketListing(
        user_id=current_user.id,
        **listing_in.dict(exclude_unset=True)
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.get("/listings/me", response_model=List[MarketListingResponse])
def get_my_listings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = db.query(MarketListing).filter(MarketListing.user_id == current_user.id).order_by(MarketListing.created_at.desc()).all()
    return listings
