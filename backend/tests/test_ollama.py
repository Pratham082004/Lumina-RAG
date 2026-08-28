import pytest
from app.services.embeddings.ollama import OllamaEmbeddingProvider
from app.services.llm.ollama import OllamaLLMProvider


@pytest.mark.asyncio
async def test_ollama_embedding(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.MagicMock()
    mock_response.json.return_value = {
        "embeddings": [[0.1, 0.2, 0.3]]
    }
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response

    provider = OllamaEmbeddingProvider()
    embedding = await provider.embed("Financial report test")

    assert len(embedding) == 3
    assert embedding == [0.1, 0.2, 0.3]


@pytest.mark.asyncio
async def test_ollama_llm(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.MagicMock()
    mock_response.json.return_value = {
        "response": "Apple's 2024 revenue was $391 billion."
    }
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response

    llm = OllamaLLMProvider()
    res = await llm.generate("What was Apple's revenue in 2024?")

    assert "391 billion" in res
