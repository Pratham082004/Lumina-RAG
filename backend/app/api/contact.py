from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.services.email_service import send_contact_email

router = APIRouter()


class ContactRequest(BaseModel):
    email: EmailStr
    message: str


class ContactResponse(BaseModel):
    status: str
    message: str


@router.post("/", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest, background_tasks: BackgroundTasks):
    email_clean = payload.email.strip()
    message_clean = payload.message.strip()

    if not message_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty.",
        )

    # Dispatch email sending in a background task to keep API response instantaneous
    background_tasks.add_task(send_contact_email, email_clean, message_clean)

    return ContactResponse(
        status="success",
        message="Thank you for contacting Lumina Finance! We have received your message.",
    )
