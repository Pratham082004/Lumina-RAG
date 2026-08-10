from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    jobTitle: Optional[str] = None
    company: Optional[str] = None
    investmentStyle: Optional[str] = None
    profileImage: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    isVerified: bool
    profileImage: Optional[str] = None
    provider: Optional[str] = None
    jobTitle: Optional[str] = None
    company: Optional[str] = None
    investmentStyle: Optional[str] = None
    onboardingCompleted: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
