import pytest

from app.retrieval.search import RetrievalService

@pytest.mark.asyncio
async def test_retrieval_service(mocker):
    # Mock embedding provider
    mock_embedding = mocker.MagicMock()
    mock_embedding.embed = mocker.AsyncMock(return_value=[0.1, 0.2, 0.3])
    
    # Mock vector store
    mock_vector_store = mocker.MagicMock()
    mock_vector_store.search = mocker.AsyncMock(return_value={
        "documents": [["Apple is great", "Risk of falling"]],
        "metadatas": [[{"section": "Business", "token_count": 10}, {"section": "Risk Factors", "token_count": 5}]],
        "distances": [[0.1, 0.2]]
    })
    
    retrieval_service = RetrievalService(
        embedding_service=mock_embedding,
        vector_store=mock_vector_store,
    )
    
    result = await retrieval_service.search(
        question="What are Apple's biggest business risks?",
        ticker="AAPL",
        limit=5,
    )
    
    assert result.question == "What are Apple's biggest business risks?"
    assert len(result.results) == 2
    
    # Check results (sorted by score descending)
    # distance 0.1 -> score 0.9
    # distance 0.2 -> score 0.8
    assert result.results[0].text == "Apple is great"
    assert result.results[0].score == 0.9
    assert result.results[0].metadata["section"] == "Business"
    
    assert result.results[1].text == "Risk of falling"
    assert result.results[1].score == 0.8
    assert result.results[1].metadata["section"] == "Risk Factors"
    
    # Verify vector store was called with correct filter
    mock_vector_store.search.assert_called_once_with(
        vector=[0.1, 0.2, 0.3],
        where={"ticker": "AAPL"},
        limit=5
    )