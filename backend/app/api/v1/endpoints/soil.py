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
        
    new_report = SoilReport(farm_id=farm.id, report_type="uploaded", file_path=file_path)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Real Document Extraction Logging
    try:
        import PyPDF2
        import re
        extracted_text = ""
        with open(file_path, "rb") as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            for page in reader.pages:
                extracted_text += page.extract_text() or ""
                
        # Regex extraction
        def extract_param(pattern, text):
            match = re.search(pattern, text, re.IGNORECASE)
            return float(match.group(1)) if match else None

        n_val = extract_param(r"Nitrogen.*?([\d\.]+)", extracted_text)
        p_val = extract_param(r"Phosphorus.*?([\d\.]+)", extracted_text)
        k_val = extract_param(r"Potassium.*?([\d\.]+)", extracted_text)
        ph_val = extract_param(r"pH.*?([\d\.]+)", extracted_text)

        actual_params = []
        if n_val:
            actual_params.append(SoilParameter(soil_report_id=new_report.id, parameter_name="Nitrogen (N)", value=n_val, unit="kg/ha", status="Extracted", interpretation="Requires manual review."))
        if p_val:
            actual_params.append(SoilParameter(soil_report_id=new_report.id, parameter_name="Phosphorus (P)", value=p_val, unit="kg/ha", status="Extracted", interpretation="Requires manual review."))
        if k_val:
            actual_params.append(SoilParameter(soil_report_id=new_report.id, parameter_name="Potassium (K)", value=k_val, unit="kg/ha", status="Extracted", interpretation="Requires manual review."))
        if ph_val:
            actual_params.append(SoilParameter(soil_report_id=new_report.id, parameter_name="pH", value=ph_val, unit="", status="Extracted", interpretation="Requires manual review."))

        if actual_params:
            db.add_all(actual_params)
        else:
            # When extraction explicitly fails, we write an invalid status to let the frontend know, instead of inventing
            db.add(SoilParameter(soil_report_id=new_report.id, parameter_name="Extraction Status", value=None, unit="", status="Unavailable", interpretation="No reliable soil parameters could be extracted from the uploaded document. Scanned images may require external OCR."))
            
    except Exception as e:
        # Fallback for non-PDFs or corrupted files
        db.add(SoilParameter(soil_report_id=new_report.id, parameter_name="Extraction Status", value=None, unit="", status="Unavailable", interpretation=f"Document parsing failed: {str(e)}"))

    db.commit()
    db.refresh(new_report)
    
    return new_report
