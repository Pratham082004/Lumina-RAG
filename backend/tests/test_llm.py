import asyncio

from app.services.llm.gemini import GeminiLLMProvider


async def main():

    llm = GeminiLLMProvider()

    answer = await llm.generate(
        "In one sentence, explain what a balance sheet is."
    )

    print(answer)


if __name__ == "__main__":
    asyncio.run(main())