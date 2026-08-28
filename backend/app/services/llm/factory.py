from app.config import settings
from app.services.llm.base import LLMProvider
from app.services.llm.ollama import OllamaLLMProvider


def get_llm_provider() -> LLMProvider:

    provider = settings.LLM_PROVIDER.lower()

    if provider == "ollama":
        return OllamaLLMProvider()

    # Default to OllamaProvider if provider is unspecified
    return OllamaLLMProvider()
