from app.ingestion.filing_lookup import SECFilingLookup

lookup = SECFilingLookup()

filing = lookup.latest_filing("0000320193")

print(filing)