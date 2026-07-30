import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.dependencies import get_rag_service
from app.retrieval.rag_service import RAGService
from app.schemas.chats import (
    ChatRequest,
    ChatResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/",
    response_model=ChatResponse,
    summary="Ask questions about SEC filings",
)
async def chat(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service),
):

    logger.info(
        "Received question: %s",
        request.question,
    )

    try:

        result = await rag_service.ask(
            question=request.question,
            limit=request.limit,
            session_id=request.session_id,
        )

        logger.info(
            "Successfully answered question."
        )

        return ChatResponse(
            company=result["company"],
            ticker=result["ticker"],
            question=result["question"],
            answer=result["answer"],
            sources=result["sources"],
        )

    except ValueError as exc:

        logger.warning(str(exc))

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:

        logger.exception(
            "Unexpected error while processing chat request."
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error.",
        )