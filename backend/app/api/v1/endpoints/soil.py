from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models import User, Farm, SoilReport, SoilParameter
from app.schemas import SoilReportResponse, SoilReportCreate, SoilParameterSchema

router = APIRouter()

@router.get("/{farm_id}", response_model=List[SoilReportResponse])
def get_soil_reports(farm_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify farm belongs to user
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
        
    reports = db.query(SoilReport).filter(SoilReport.farm_id == farm_id).order_by(SoilReport.uploaded_at.desc()).all()
    return reports

@router.post("/manual", response_model=SoilReportResponse)
def create_manual_report(report_data: SoilReportCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify farm belongs to user
    farm = db.query(Farm).filter(Farm.id == report_data.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
        
    new_report = SoilReport(farm_id=farm.id, report_type="manual")
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    for param_data in report_data.parameters:
        param = SoilParameter(
            soil_report_id=new_report.id,
            **param_data.dict()
        )
        db.add(param)
        
    db.commit()
    db.refresh(new_report)
    return new_report

@router.post("/upload", response_model=SoilReportResponse)
async def upload_soil_report(
    farm_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify farm
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
        
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{farm_id}_{datetime.now().timestamp()}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # In a real app, you would parse the PDF/Image using OCR (e.g. AWS Textract, Tesseract) here to extract parameters.
    # For now, we just save the file path and create an empty report.
    
    new_report = SoilReport(farm_id=farm.id, report_type="uploaded", file_path=file_path)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Mock extracted parameters based on typical Indian soil averages for demo visual feedback
    mock_params = [
        SoilParameter(soil_report_id=new_report.id, parameter_name="Nitrogen (N)", value=250.0, unit="kg/ha", status="Medium", interpretation="Sufficient for most vegetative growth."),
        SoilParameter(soil_report_id=new_report.id, parameter_name="Phosphorus (P)", value=28.5, unit="kg/ha", status="Optimal", interpretation="Good for root development."),
        SoilParameter(soil_report_id=new_report.id, parameter_name="Potassium (K)", value=180.0, unit="kg/ha", status="High", interpretation="Excellent for disease resistance and fruit quality."),
        SoilParameter(soil_report_id=new_report.id, parameter_name="pH", value=6.8, unit="", status="Optimal", interpretation="Neutral pH, ideal for most crops."),
    ]
    db.add_all(mock_params)
    db.commit()
    db.refresh(new_report)
    
    return new_report
