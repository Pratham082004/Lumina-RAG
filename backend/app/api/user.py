from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.session import get_db
from app.models.user import User
from app.models.chat_session import ChatSession, Message
from app.schemas.user import UserOut, UserProfileUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/stats/{user_id}")
def get_user_stats(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    chat_sessions = db.query(ChatSession).filter(ChatSession.userId == user_id).all()
    session_ids = [s.id for s in chat_sessions]
    
    total_messages = 0
    if session_ids:
        total_messages = db.query(Message).filter(Message.chatSessionId.in_(session_ids)).count()
        
    return {
        "totalQueries": total_messages // 2,  # Assuming user + assistant pairs
        "documentsAnalyzed": len(chat_sessions),  # Approximate based on sessions
        "activeDays": 1,  # Mock logic for active days
        "lastActive": datetime.utcnow().isoformat()
    }


@router.put("/profile/{user_id}", response_model=UserOut)
def update_profile(user_id: str, payload: UserProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
        
    current_user.onboardingCompleted = True
    db.commit()
    db.refresh(current_user)
    
    return current_user
