import logging
from typing import List
import httpx

from app.config import settings
from app.services.embeddings.base import EmbeddingProvider

logger = logging.getLogger(__name__)


class OllamaEmbeddingProvider(EmbeddingProvider):
    """
    Ollama embedding provider using Ollama's HTTP API.
    Supports models like 'bge-m3', 'nomic-embed-text', etc.
    """

    def __init__(
        self,
        base_url: str | None = None,
        model_name: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.OLLAMA_EMBED_MODEL
        self.embed_url = f"{self.base_url}/api/embed"
        self.timeout = 60.0

    async def embed(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        """
        batch_result = await self.embed_batch([text])
        if batch_result and len(batch_result) > 0:
            return batch_result[0]
        return []

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        """
        if not texts:
            return []

        payload = {
            "model": self.model_name,
            "input": texts,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(self.embed_url, json=payload)
            response.raise_for_status()

            data = response.json()
            embeddings = data.get("embeddings", [])
            return embeddings
