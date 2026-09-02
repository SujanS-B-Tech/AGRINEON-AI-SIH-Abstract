from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Farm, CropRecommendation, CropPlan, CropTask
from app.schemas import CropRecommendRequest, CropRecommendationResponse, CropSelectRequest, CropPlanResponse
from app.services.crop_engine import recommend_crops, generate_farming_tasks

router = APIRouter()

@router.post("/recommend", response_model=List[CropRecommendationResponse])
def get_crop_recommendations(req: CropRecommendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify farm 
    farm = db.query(Farm).filter(Farm.id == req.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    # Clear previous unselected recommendations
    db.query(CropRecommendation).filter(
        CropRecommendation.farm_id == farm.id,
        CropRecommendation.is_selected == False
    ).delete()

    params = req.dict(exclude_unset=True)
    
    # Generate recommendations using engine
    recommendations_data = recommend_crops(params, top_n=3)
    
    results = []
    for data in recommendations_data:
        rec = CropRecommendation(farm_id=farm.id, **data)
        db.add(rec)
        results.append(rec)
        
    db.commit()
    for rec in results:
        db.refresh(rec)
        
    return results

@router.post("/select", response_model=CropPlanResponse)
def select_crop(req: CropSelectRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == req.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
        
    rec = db.query(CropRecommendation).filter(CropRecommendation.id == req.recommendation_id, CropRecommendation.farm_id == farm.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    # Deselect all, select this one
    db.query(CropRecommendation).filter(CropRecommendation.farm_id == farm.id).update({"is_selected": False})
    rec.is_selected = True
    
    # Update farm current crop
    farm.current_crop = rec.crop_name
    farm.crop_stage = "Planning"
    
    # Delete old plans for this farm if they exist (simplification for prototype)
    db.query(CropPlan).filter(CropPlan.farm_id == farm.id).delete()
    
    # Create new Crop Plan
    plan = CropPlan(
        farm_id=farm.id,
        crop_name=rec.crop_name,
        season=farm.current_season,
        start_date=date.today(),
        current_stage="Land Preparation"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    # Generate Lifecycle Tasks
    tasks_data = generate_farming_tasks(plan.crop_name, plan.season)
    for td in tasks_data:
        db.add(CropTask(crop_plan_id=plan.id, **td))
        
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/plan/{farm_id}", response_model=CropPlanResponse)
def get_farming_plan(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
        
    plan = db.query(CropPlan).filter(CropPlan.farm_id == farm_id).order_by(CropPlan.created_at.desc()).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active farming plan found")
        
    return plan

@router.get("/{id}", response_model=CropRecommendationResponse)
def get_crop_details(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = db.query(CropRecommendation).filter(CropRecommendation.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    
    # verify ownership
    farm = db.query(Farm).filter(Farm.id == rec.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    return rec
