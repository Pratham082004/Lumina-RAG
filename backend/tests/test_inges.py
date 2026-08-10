import asyncio

from app.ingestion.chunker import FilingChunker
from app.ingestion.company_lookup import SECCompanyLookup
from app.ingestion.downloader import SECDownloader
from app.ingestion.filing_lookup import SECFilingLookup
from app.ingestion.parser import FilingParser
from app.ingestion.pipeline import IngestionPipeline

from app.services.embeddings.gemini import GeminiEmbeddingProvider
from app.services.vector_store.chroma import ChromaService


async def main():

    print("=" * 70)
    print("Lumina Finance Ingestion Pipeline Test")
    print("=" * 70)

    company_lookup = SECCompanyLookup()
    filing_lookup = SECFilingLookup()
    downloader = SECDownloader()
    parser = FilingParser()
    chunker = FilingChunker()

    embedding_service = GeminiEmbeddingProvider()

    vector_store = ChromaService()

    # Create collection if it doesn't exist
    if not await vector_store.collection_exists():
        await vector_store.create_collection()
    else:
        print("✓ Chroma collection already exists.")

    pipeline = IngestionPipeline(
        company_lookup=company_lookup,
        filing_lookup=filing_lookup,
        downloader=downloader,
        parser=parser,
        chunker=chunker,
        embedding_service=embedding_service,
        vector_store=vector_store,
    )

    result = await pipeline.ingest(
        ticker="AAPL",
        filing_type="10-K",
    )

    print()
    print("=" * 70)
    print("INGESTION RESULT")
    print("=" * 70)

    print(f"Company     : {result.company}")
    print(f"Ticker      : {result.ticker}")
    print(f"Form        : {result.filing_type}")
    print(f"Date        : {result.filing_date}")
    print(f"Sections    : {result.sections}")
    print(f"Chunks      : {result.chunks}")
    print(f"Vectors     : {result.vectors}")
    print(f"Status      : {result.status}")
    print(f"Message     : {result.message}")

    print()
    print("🎉 Pipeline completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())