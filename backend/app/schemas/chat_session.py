from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageCreate(BaseModel):
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None

class MessageOut(BaseModel):
    id: str
    chatSessionId: str
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    title: str

class ChatSessionOut(BaseModel):
    id: str
    userId: str
    title: str
    createdAt: datetime
    updatedAt: datetime
    messages: Optional[List[MessageOut]] = []

    class Config:
        from_attributes = True
