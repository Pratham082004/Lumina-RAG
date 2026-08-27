import json

from app.ingestion.parser import FilingParser

def test_filing_parser(tmp_path):
    parser = FilingParser()

    # Create dummy metadata and html
    metadata = {
        "company": "Apple Inc",
        "ticker": "AAPL",
        "form": "10-K",
        "filing_date": "2025-01-01"
    }
    
    html_content = """
    <html>
        <body>
            <h1>Item 1. Business</h1>
            <p>We sell phones.</p>
            <h1>Item 1A. Risk Factors</h1>
            <p>Phones might break.</p>
        </body>
    </html>
    """

    metadata_path = tmp_path / "metadata.json"
    metadata_path.write_text(json.dumps(metadata))

    html_path = tmp_path / "filing.html"
    html_path.write_text(html_content)

    parsed = parser.parse(html_path)

    assert parsed.title == "Apple Inc 10-K"
    assert parsed.company == "Apple Inc"
    assert parsed.ticker == "AAPL"
    assert parsed.filing_type == "10-K"
    assert parsed.filing_date == "2025-01-01"
    
    # Assert some text was extracted
    assert "We sell phones." in parsed.raw_text
    assert "Phones might break." in parsed.raw_text