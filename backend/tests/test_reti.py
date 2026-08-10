import asyncio

from app.retrieval.search import RetrievalService

from app.services.embeddings.gemini import GeminiEmbeddingProvider
from app.services.vector_store.chroma import ChromaService


async def main():

    print("=" * 70)
    print("Lumina Finance Retrieval Test")
    print("=" * 70)

    embedding_service = GeminiEmbeddingProvider()
    vector_store = ChromaService()

    retrieval_service = RetrievalService(
        embedding_service=embedding_service,
        vector_store=vector_store,
    )

    result = await retrieval_service.search(
        question="What are Apple's biggest business risks?",
        ticker="AAPL",
        limit=5,
    )

    print()
    print("=" * 70)
    print("RETRIEVED CHUNKS")
    print("=" * 70)

    for i, chunk in enumerate(result.results, start=1):

        print(f"\nChunk {i}")
        print("-" * 70)
        print(f"Score   : {chunk.score:.4f}")
        print(f"Section : {chunk.metadata.get('section')}")
        print(f"Tokens  : {chunk.metadata.get('token_count')}")
        print()
        print(chunk.text[:500])
        print()

    print("=" * 70)
    print(f"Retrieved {len(result.results)} chunks.")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())