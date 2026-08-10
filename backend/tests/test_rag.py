import asyncio

from app.retrieval.rag_service import RAGService
from app.retrieval.search import RetrievalService
from app.services.embeddings.gemini import GeminiEmbeddingProvider
from app.services.llm.gemini import GeminiLLMProvider
from app.services.vector_store.chroma import ChromaService


async def main():

    embedding_service = GeminiEmbeddingProvider()
    vector_store = ChromaService()
    llm_service = GeminiLLMProvider()

    retrieval_service = RetrievalService(
        embedding_service=embedding_service,
        vector_store=vector_store,
    )

    rag = RAGService(
        retrieval_service=retrieval_service,
        llm_service=llm_service,
    )

    result = await rag.ask(
        question="What are Apple's biggest business?",
        ticker="AAPL",
        limit=5,
    )

    print("=" * 80)
    print("QUESTION")
    print("=" * 80)
    print(result["question"])

    print("\n" + "=" * 80)
    print("ANSWER")
    print("=" * 80)
    print(result["answer"])

    print("\n" + "=" * 80)
    print("SOURCES")
    print("=" * 80)

    for source in result["sources"]:
        print(source)


if __name__ == "__main__":
    asyncio.run(main())