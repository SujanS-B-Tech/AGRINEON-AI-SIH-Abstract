from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import ChatRequest, ChatResponse
from app.services.chat_engine import generate_response

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat_with_assistant(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        response_data = generate_response(
            query=req.message,
            language=req.language,
            db=db,
            user_id=current_user.id
        )
        return response_data
    except Exception as e:
        # Fallback error
        import logging
        logging.error(f"Chat error: {e}")
        return {"reply": "I'm having trouble retrieving that information right now. Please try again later.", "source": "system"}
