import random
from datetime import datetime, timedelta
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app.database.session import get_db
from app.models.user import User, EmailVerificationToken
from app.schemas.auth import UserCreate, UserLogin, Token, VerifyOTP, ResendOTP, GoogleLogin
from app.schemas.user import UserOut
from app.services.auth_service import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.services.email_service import send_otp_email
from app.config import settings

router = APIRouter()

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    verification_token = EmailVerificationToken(
        token=otp,
        userId=new_user.id,
        expiresAt=expires_at
    )
    db.add(verification_token)
    db.commit()

    background_tasks.add_task(send_otp_email, user.email, otp)
    return new_user


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.isVerified:
        raise HTTPException(status_code=403, detail="Email not verified")
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "onboardingCompleted": user.onboardingCompleted
    }


@router.post("/verify")
def verify_otp(payload: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    token_record = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.userId == user.id,
        EmailVerificationToken.token == payload.otp
    ).first()
    
    if not token_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if token_record.expiresAt < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
        
    user.isVerified = True
    db.delete(token_record)
    db.commit()
    
    return {"message": "Email verified successfully"}


@router.post("/resend-otp")
def resend_otp(payload: ResendOTP, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.isVerified:
        raise HTTPException(status_code=400, detail="Email already verified")
        
    db.query(EmailVerificationToken).filter(EmailVerificationToken.userId == user.id).delete()
    
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    verification_token = EmailVerificationToken(
        token=otp,
        userId=user.id,
        expiresAt=expires_at
    )
    db.add(verification_token)
    db.commit()
    
    background_tasks.add_task(send_otp_email, user.email, otp)
    return {"message": "OTP sent successfully"}


@router.post("/google", response_model=Token)
def google_auth(payload: GoogleLogin, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            payload.token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = idinfo["email"]
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")
        google_id = idinfo["sub"]
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                profileImage=picture,
                isVerified=True,
                provider="google",
                providerId=google_id
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "onboardingCompleted": user.onboardingCompleted
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
