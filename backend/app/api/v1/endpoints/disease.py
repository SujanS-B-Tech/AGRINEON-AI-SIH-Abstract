from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models import User, Farm, DiseasePrediction
from app.schemas import DiseaseResponse
from app.services.disease_engine import analyze_disease

router = APIRouter()

@router.post("/predict", response_model=DiseaseResponse)
async def predict_disease(
    farm_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify farm belongs to user
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"disease_{farm_id}_{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Analyze disease
    crop_name = farm.current_crop or "unknown"
    analysis_result = analyze_disease(filename, crop_name)
    
    # Save to database
    prediction = DiseasePrediction(
        farm_id=farm.id,
        image_path=file_path,
        disease_name=analysis_result["disease"],
        confidence=analysis_result["confidence"],
        symptoms=analysis_result["symptoms"],
        prevention=analysis_result["prevention"],
        next_steps=analysis_result["next_steps"]
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return prediction
