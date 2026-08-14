import pytest

from app.services.embeddings.gemini import GeminiEmbeddingProvider

@pytest.mark.asyncio
async def test_gemini_embeddings(mocker):
    # Mock genai client
    mock_client = mocker.patch("app.services.embeddings.gemini.genai.Client")
    
    # Mock the nested models.embed_content response
    mock_embed_response = mocker.MagicMock()
    mock_embedding = mocker.MagicMock()
    mock_embedding.values = [0.1, 0.2, 0.3]
    mock_embed_response.embeddings = [mock_embedding]
    
    mock_client.return_value.models.embed_content.return_value = mock_embed_response

    provider = GeminiEmbeddingProvider()
    vector = await provider.embed("Apple reported record revenue.")

    assert len(vector) == 3
    assert vector == [0.1, 0.2, 0.3]
    
    # Verify the mock was called correctly
    mock_client.return_value.models.embed_content.assert_called_once_with(
        model=provider.model,
        contents="Apple reported record revenue."
    )