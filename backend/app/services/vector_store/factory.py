from functools import lru_cache

from app.config import settings
from app.services.vector_store.chroma import ChromaService
from app.services.vector_store.base import VectorStore


@lru_cache(maxsize=1)
def get_vector_store() -> VectorStore:
    """
    Return the configured vector store.

    The instance is cached so the entire application
    shares a single Chroma client.
    """

    match settings.VECTOR_DB.lower():

        case "chroma":
            return ChromaService()

        case _:
            raise ValueError(
                f"Unsupported vector database: {settings.VECTOR_DB}"
            )