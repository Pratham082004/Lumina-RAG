from pydantic import BaseModel


class Source(BaseModel):

    section: str | None
    score: float


class ChatRequest(BaseModel):

    question: str
    limit: int = 5
    session_id: str | None = None


class ChatResponse(BaseModel):

    answer: str
    sources: list[Source]