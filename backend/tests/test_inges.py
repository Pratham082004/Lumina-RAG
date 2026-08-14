import pytest
from pathlib import Path

from app.ingestion.pipeline import IngestionPipeline
from app.ingestion.company_lookup import CompanyInfo
from app.schemas.parsed_filing import ParsedFiling, FilingChunk

@pytest.mark.asyncio
async def test_ingestion_pipeline(mocker):
    # Mock services
    mock_company_lookup = mocker.MagicMock()
    mock_company_lookup.search = mocker.AsyncMock(return_value=CompanyInfo(cik="123", ticker="AAPL", name="Apple"))
    
    mock_filing_lookup = mocker.MagicMock()
    mock_filing = mocker.MagicMock()
    mock_filing.form = "10-K"
    mock_filing.filing_date = "2025-01-01"
    mock_filing_lookup.latest_filing = mocker.AsyncMock(return_value=mock_filing)
    mock_filing_lookup.get_filing = mocker.AsyncMock(return_value=mock_filing)
    
    mock_downloader = mocker.MagicMock()
    mock_downloader.ensure_downloaded = mocker.AsyncMock(return_value=Path("/tmp/mock.html"))
    
    mock_parser = mocker.MagicMock()
    mock_parsed = ParsedFiling(
        company="Apple", ticker="AAPL", filing_type="10-K",
        filing_date="2025-01-01", title="Apple 10-K", raw_text="...", sections=[]
    )
    mock_parser.parse.return_value = mock_parsed
    
    mock_chunker = mocker.MagicMock()
    mock_chunk = FilingChunk(chunk_id=1, section="Business", text="...", token_count=10)
    mock_chunker.chunk.return_value = [mock_chunk]
    
    mock_embedding = mocker.MagicMock()
    mock_embedding.embed_batch = mocker.AsyncMock(return_value=[[0.1, 0.2]])
    
    mock_vector = mocker.MagicMock()
    mock_vector.collection_exists = mocker.AsyncMock(return_value=True)
    mock_vector.upsert = mocker.AsyncMock()

    mock_report_repo = mocker.MagicMock()
    mock_report_repo.has_report.return_value = False
    
    mock_company_repo = mocker.MagicMock()
    mock_company_model = mocker.MagicMock()
    mock_company_model.id = 1
    mock_company_model.ticker = "AAPL"
    mock_company_model.cik = "123"
    mock_company_model.name = "Apple"
    mock_company_repo.get_or_create_by_ticker.return_value = mock_company_model

    pipeline = IngestionPipeline(
        company_lookup=mock_company_lookup,
        filing_lookup=mock_filing_lookup,
        downloader=mock_downloader,
        parser=mock_parser,
        chunker=mock_chunker,
        embedding_service=mock_embedding,
        vector_store=mock_vector,
        report_repo=mock_report_repo,
        company_repo=mock_company_repo,
    )
    
    # Run the pipeline
    result = await pipeline.ingest("AAPL", "10-K")
    
    # Verify result
    assert result.status == "SUCCESS"
    assert result.company == "Apple"
    assert result.ticker == "AAPL"
    assert result.chunks == 1
    assert result.vectors == 1
    
    # Verify orchestration
    assert mock_company_lookup.search.call_count == 2
    mock_company_lookup.search.assert_called_with("AAPL")
    mock_filing_lookup.latest_filing.assert_called_once_with(cik="123", form_type="10-K")
    mock_downloader.ensure_downloaded.assert_called_once()
    mock_parser.parse.assert_called_once()
    mock_chunker.chunk.assert_called_once_with(mock_parsed)
    mock_embedding.embed_batch.assert_called_once_with(["..."])
    mock_vector.upsert.assert_called_once()