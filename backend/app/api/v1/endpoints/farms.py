from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Farm
from app.schemas import FarmCreate, FarmUpdate, FarmResponse

router = APIRouter()

@router.get("/", response_model=List[FarmResponse])
def get_farms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all farms for the current user."""
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms

@router.post("/", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(farm_in: FarmCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new farm profile."""
    new_farm = Farm(
        user_id=current_user.id,
        **farm_in.dict(exclude_unset=True)
    )
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a specific farm by ID."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm

@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, farm_in: FarmUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update a farm profile."""
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    update_data = farm_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farm, key, value)
        
    db.commit()
    db.refresh(farm)
    return farm
