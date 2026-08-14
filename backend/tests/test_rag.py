import pytest

from app.retrieval.rag_service import RAGService
from app.retrieval.models import RetrievalResult, SearchResult

@pytest.mark.asyncio
async def test_rag_service(mocker):
    # Mock retrieval service
    mock_retrieval_service = mocker.MagicMock()
    mock_retrieval_result = RetrievalResult(
        question="What are Apple's biggest business?",
        results=[
            SearchResult(
                text="Apple makes a lot of money from iPhones.",
                metadata={"section": "Business", "ticker": "AAPL", "year": "2024"},
                score=0.95
            ),
            SearchResult(
                text="Services are also a huge part of Apple's revenue.",
                metadata={"section": "Business", "ticker": "AAPL", "year": "2024"},
                score=0.85
            )
        ]
    )
    mock_retrieval_service.search = mocker.AsyncMock(return_value=mock_retrieval_result)
    
    # Mock LLM service
    mock_llm_service = mocker.MagicMock()
    mock_llm_service.generate = mocker.AsyncMock(return_value="Apple's biggest businesses are iPhones and Services.")

    # Mock company resolver
    mock_company_resolver = mocker.MagicMock()
    mock_company_resolver.resolve = mocker.AsyncMock(return_value={"ticker": "AAPL", "company": "Apple Inc."})

    # Mock ingestion manager
    mock_ingestion_manager = mocker.MagicMock()
    mock_ingestion_manager.ensure_company_ready = mocker.AsyncMock()

    rag = RAGService(
        retrieval_service=mock_retrieval_service,
        llm_service=mock_llm_service,
        company_resolver=mock_company_resolver,
        ingestion_manager=mock_ingestion_manager,
    )

    result = await rag.ask(
        question="What are Apple's biggest business?",
        tickers=["AAPL"],
        limit=5,
    )
    
    # Verify the result structure
    assert result["question"] == "What are Apple's biggest business?"
    assert result["answer"] == "Apple's biggest businesses are iPhones and Services."
    assert len(result["sources"]) == 2
    
    # Verify the sources list is correctly populated
    assert result["sources"][0]["section"] == "Business"
    assert result["sources"][0]["score"] == 0.95
    
    # Verify the internal service calls
    mock_retrieval_service.search.assert_called_once_with(
        question="What are Apple's biggest business?",
        ticker=["AAPL"],
        limit=5
    )
    
    mock_llm_service.generate.assert_called_once()