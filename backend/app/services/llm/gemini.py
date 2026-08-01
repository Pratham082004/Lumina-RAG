import asyncio
import logging

from google import genai

from app.config import settings
from app.services.llm.base import LLMProvider

logger = logging.getLogger(__name__)


class GeminiLLMProvider(LLMProvider):

    def __init__(self):

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

        self.model = settings.GEMINI_MODEL

    async def generate(
        self,
        prompt: str,
    ) -> str:

        retries = 3

        for attempt in range(retries):

            try:

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                )

                return response.text

            except Exception as exc:

                logger.warning(
                    "Generation failed (%d/%d): %s",
                    attempt + 1,
                    retries,
                    exc,
                )

                if attempt == retries - 1:
                    raise

                await asyncio.sleep(2 ** attempt)

    async def generate_stream(
        self,
        prompt: str,
    ):
        try:
            if hasattr(self.client, "aio"):
                response = await self.client.aio.models.generate_content_stream(
                    model=self.model,
                    contents=prompt,
                )
                async for chunk in response:
                    if chunk.text:
                        yield chunk.text
            else:
                response = self.client.models.generate_content_stream(
                    model=self.model,
                    contents=prompt,
                )
                for chunk in response:
                    if chunk.text:
                        yield chunk.text
        except Exception as exc:
            logger.warning("Streaming generation failed: %s", exc)
            raise