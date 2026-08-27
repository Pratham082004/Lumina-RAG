from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.models.chat_session import ChatSession, Message
from app.schemas.chat_session import ChatSessionCreate, ChatSessionOut, MessageCreate, MessageOut
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/{user_id}", response_model=List[ChatSessionOut])
def get_user_sessions(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    sessions = db.query(ChatSession).filter(ChatSession.userId == user_id).order_by(ChatSession.updatedAt.desc()).all()
    return sessions


@router.get("/session/{session_id}", response_model=List[MessageOut])
def get_session_messages(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session or session.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    messages = db.query(Message).filter(Message.chatSessionId == session_id).order_by(Message.createdAt.asc()).all()
    return messages


@router.post("/{user_id}", response_model=ChatSessionOut)
def create_session(user_id: str, payload: ChatSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    new_session = ChatSession(
        userId=user_id,
        title=payload.title
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.post("/session/{session_id}/message", response_model=MessageOut)
def add_message(session_id: str, payload: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session or session.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    new_msg = Message(
        chatSessionId=session_id,
        role=payload.role,
        content=payload.content,
        sources=payload.sources
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.delete("/session/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session or session.userId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}
