from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class ContactRequest(BaseModel):
    email: str
    message: str


class ContactResponse(BaseModel):
    status: str
    message: str


@router.post("/", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest):
    email_clean = payload.email.strip()
    message_clean = payload.message.strip()

    if not email_clean or "@" not in email_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    if not message_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty.",
        )

    return ContactResponse(
        status="success",
        message="Thank you for contacting Lumina Finance! We have received your message.",
    )
