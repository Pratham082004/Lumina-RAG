import pytest
from app.ingestion.filing_lookup import SECFilingLookup, FilingInfo


@pytest.mark.asyncio
async def test_filing_lookup_latest(mocker):
    mock_info = FilingInfo(
        form="10-K",
        filing_date="2025-01-01",
        accession_number="0000000000-25-000001",
        primary_document="doc.htm",
    )
    mocker.patch.object(
        SECFilingLookup,
        "latest_filing",
        new_callable=mocker.AsyncMock,
        return_value=mock_info,
    )

    lookup = SECFilingLookup()
    filing = await lookup.latest_filing("0000320193")

    assert filing is not None
    assert filing.form == "10-K"
    assert filing.accession_number == "0000000000-25-000001"