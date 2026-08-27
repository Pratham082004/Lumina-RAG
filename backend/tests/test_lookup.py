import pytest
from pathlib import Path

from app.ingestion.company_lookup import SECCompanyLookup, CompanyInfo
from app.ingestion.filing_lookup import SECFilingLookup
from app.ingestion.downloader import SECDownloader


@pytest.mark.asyncio
async def test_sec_lookups(mocker):
    # Mock CompanyInfo
    mock_company = CompanyInfo(cik="0000320193", ticker="AAPL", name="Apple Inc.")
    
    # Mock SECCompanyLookup
    mocker.patch.object(
        SECCompanyLookup, 
        "search", 
        new_callable=mocker.AsyncMock,
        return_value=mock_company
    )

    company_lookup = SECCompanyLookup()
    company = await company_lookup.search("Apple")

    assert company is not None
    assert company.ticker == "AAPL"
    assert company.name == "Apple Inc."

    # Mock SECFilingLookup
    mock_filing = mocker.MagicMock()
    mock_filing.form = "10-K"
    mock_filing.filing_date = "2025-01-01"

    mocker.patch.object(
        SECFilingLookup,
        "latest_filing",
        new_callable=mocker.AsyncMock,
        return_value=mock_filing
    )

    filing_lookup = SECFilingLookup()
    filing = await filing_lookup.latest_filing(company.cik)

    assert filing is not None
    assert filing.form == "10-K"
    assert filing.filing_date == "2025-01-01"

    # Mock SECDownloader
    mocker.patch.object(
        SECDownloader,
        "download",
        new_callable=mocker.AsyncMock,
        return_value=Path("/mocked/path/filing.html")
    )

    downloader = SECDownloader()
    path = await downloader.download(
        company=company,
        filing=filing,
    )

    assert path.as_posix() == "/mocked/path/filing.html"