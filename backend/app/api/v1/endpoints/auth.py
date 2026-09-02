from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models import User, Farm
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email is available
    if user_data.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        preferred_language=user_data.preferred_language
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Farm Profile
    new_farm = Farm(
        user_id=new_user.id,
        location=user_data.location,
        land_area=user_data.land_area,
        soil_type=user_data.soil_type,
        water_availability=user_data.water_availability,
        previous_crop=user_data.previous_crop,
        current_season=user_data.current_season
    )
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)

    # Generate Token
    token = create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "location": new_farm.location,
            "language": new_user.preferred_language
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Authenticate - check email or phone
    user = db.query(User).filter(
        (User.email == login_data.email) | (User.phone == login_data.email)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get farm location for frontend context
    farm = db.query(Farm).filter(Farm.user_id == user.id).first()
    location = farm.location if farm else ""

    # Generate Token
    token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "location": location,
            "language": user.preferred_language
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
