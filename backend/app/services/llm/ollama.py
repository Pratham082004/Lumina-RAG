import json
import logging
from typing import AsyncGenerator
import httpx

from app.config import settings
from app.services.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class OllamaLLMProvider(LLMProvider):
    """
    Ollama LLM provider using Ollama's HTTP API (/api/generate).
    Supports models like 'qwen2.5', 'llama3.1', 'mistral', etc.
    """

    def __init__(
        self,
        base_url: str | None = None,
        model_name: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.OLLAMA_LLM_MODEL
        self.generate_url = f"{self.base_url}/api/generate"
        self.timeout = 120.0

    async def generate(self, prompt: str) -> str:
        """
        Generate a complete text response from Ollama.
        """
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(self.generate_url, json=payload)
            response.raise_for_status()

            data = response.json()
            return data.get("response", "")

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Stream text response token-by-token from Ollama.
        """
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("POST", self.generate_url, json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        chunk = data.get("response", "")
                        if chunk:
                            yield chunk
                    except json.JSONDecodeError:
                        continue
