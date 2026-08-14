from app.ingestion.chunker import FilingChunker
from app.schemas.parsed_filing import ParsedFiling, FilingSection


def test_filing_chunker():
    chunker = FilingChunker()

    # Create mock parsed filing
    parsed = ParsedFiling(
        company="Apple Inc",
        ticker="AAPL",
        filing_type="10-K",
        filing_date="2025-01-01",
        title="Apple Inc 10-K",
        raw_text="This is a test document with some text. " * 50,
        sections=[
            FilingSection(
                title="Item 1. Business",
                content="Apple sells iPhones and MacBooks. " * 20
            ),
            FilingSection(
                title="Item 1A. Risk Factors",
                content="Competitors might make better phones. " * 20
            )
        ]
    )

    chunks = chunker.chunk(parsed)

    assert len(chunks) > 0
    
    # Verify chunk structure
    first_chunk = chunks[0]
    assert first_chunk.section == "Item 1. Business"
    assert len(first_chunk.text) > 0
    assert first_chunk.token_count > 0

    # Ensure chunk IDs are sequentially assigned
    assert chunks[0].chunk_id == 1
    assert chunks[-1].chunk_id == len(chunks)