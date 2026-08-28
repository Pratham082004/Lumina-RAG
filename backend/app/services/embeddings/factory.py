from app.config import settings
from app.services.embeddings.base import EmbeddingProvider
from app.services.embeddings.ollama import OllamaEmbeddingProvider


def get_embedding_provider() -> EmbeddingProvider:

    provider = settings.EMBEDDING_PROVIDER.lower()

    if provider == "ollama":
        return OllamaEmbeddingProvider()

    # Default to OllamaProvider if provider is unspecified
    return OllamaEmbeddingProvider()