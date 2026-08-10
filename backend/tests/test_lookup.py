"""from app.ingestion.company_lookup import SECCompanyLookup
from app.ingestion.filing_lookup import SECFilingLookup
from app.ingestion.downloader import SECDownloader


def main():
    company_lookup = SECCompanyLookup()
    filing_lookup = SECFilingLookup()

    company = company_lookup.search("Apple")
    print(f"Company: {company.name} ({company.ticker})")

    filing = filing_lookup.latest_filing(company.cik)
    print(f"Latest Filing: {filing.form} ({filing.filing_date})")

    with SECDownloader() as downloader:
        path = downloader.download(
            company=company,
            filing=filing,
        )

    print(f"\nDownloaded to: {path}")


if __name__ == "__main__":
    main()
    """

from pathlib import Path

from app.ingestion.parser import FilingParser

parser = FilingParser()

text = parser.parse(
    Path(
        "storage/reports/AAPL/2025/10-K/000032019325000079/filing.html"
    )
)

print(text[:5000])