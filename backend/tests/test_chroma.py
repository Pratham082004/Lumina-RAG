import pytest

from app.services.vector_store.chroma import ChromaService

@pytest.mark.asyncio
async def test_chroma_create_collection(mocker):
    # Mock the chromadb client inside ChromaService
    mock_chromadb = mocker.patch("app.services.vector_store.chroma.chromadb")
    
    # Create the service
    service = ChromaService()
    
    # Ensure the client is accessed
    assert service.client is not None

    # Call create_collection
    await service.create_collection()
    
    # Assert that get_or_create_collection was called on the mock client
    service.client.get_or_create_collection.assert_called_once()