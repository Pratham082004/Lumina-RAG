import logging

from app.ingestion.models import IngestionResult
from app.models.report import Report

logger = logging.getLogger(__name__)


class IngestionPipeline:

    def __init__(
        self,
        company_lookup,
        filing_lookup,
        downloader,
        parser,
        chunker,
        embedding_service,
        vector_store,
        report_repo,
        company_repo,
    ):
        self.company_lookup = company_lookup
        self.filing_lookup = filing_lookup
        self.downloader = downloader
        self.parser = parser
        self.chunker = chunker
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.report_repo = report_repo
        self.company_repo = company_repo

    async def ingest_year(
        self,
        ticker: str,
        year: int,
        filing_type: str = "10-K",
    ) -> IngestionResult:

        logger.info(
            "Starting ingestion for %s (%s - %s)",
            ticker,
            filing_type,
            year,
        )

        # --------------------------------------------------
        # Company Lookup
        # --------------------------------------------------

        company_info = await self.company_lookup.search(
            ticker
        )

        if company_info is None:
            raise ValueError(
                f"Company '{ticker}' not found."
            )

        logger.info(
            "Found company %s (%s)",
            company_info.name,
            company_info.ticker,
        )

        # --------------------------------------------------
        # Get / Create Company in DB
        # --------------------------------------------------

        company = self.company_repo.get_or_create_by_ticker(
            ticker=company_info.ticker,
            name=company_info.name,
            cik=company_info.cik,
        )

        # --------------------------------------------------
        # Already Indexed?
        # --------------------------------------------------

        if self.report_repo.has_report(
            company_id=company.id,
            fiscal_year=year,
            filing_type=filing_type,
        ):

            logger.info(
                "%s %s already ingested.",
                ticker,
                year,
            )

            report = self.report_repo.get_report(
                company_id=company.id,
                fiscal_year=year,
                filing_type=filing_type,
            )

            return IngestionResult(
                company=company.name,
                ticker=company.ticker,
                filing_type=filing_type,
                filing_date=report.report_date,
                sections=0,
                chunks=0,
                vectors=0,
                status="SKIPPED",
                message="Already indexed.",
            )

        # --------------------------------------------------
        # Filing Lookup
        # --------------------------------------------------

        filing = await self.filing_lookup.get_filing(
            cik=company.cik,
            year=year,
            form_type=filing_type,
        )

        if filing is None:
            raise ValueError(
                f"No {filing_type} filing found for {ticker} ({year})"
            )

        logger.info(
            "Found filing %s",
            filing.accession_number,
        )

        # --------------------------------------------------
        # Download
        # --------------------------------------------------

        html_path = await self.downloader.ensure_downloaded(
            company,
            filing,
        )

        # --------------------------------------------------
        # Parse
        # --------------------------------------------------

        parsed_filing = self.parser.parse(
            html_path
        )

        # --------------------------------------------------
        # Chunk
        # --------------------------------------------------

        chunks = self.chunker.chunk(
            parsed_filing
        )

        # --------------------------------------------------
        # Embeddings
        # --------------------------------------------------

        vectors = await self.embedding_service.embed_batch(
            [
                chunk.text
                for chunk in chunks
            ]
        )

        # --------------------------------------------------
        # Payloads
        # --------------------------------------------------

        payloads = []

        for chunk in chunks:

            payloads.append(
                {
                    "ticker": company.ticker,
                    "company": company.name,
                    "company_id": company.id,
                    "cik": company.cik,
                    "year": year,
                    "filing_type": filing.form,
                    "filing_date": filing.filing_date,
                    "accession_number": filing.accession_number,
                    "section": chunk.section,
                    "chunk_id": chunk.chunk_id,
                    "token_count": chunk.token_count,
                    "text": chunk.text,
                }
            )

        # --------------------------------------------------
        # Chroma
        # --------------------------------------------------

        await self.vector_store.upsert(
            vectors=vectors,
            payloads=payloads,
        )

        # --------------------------------------------------
        # Save Report Metadata
        # --------------------------------------------------

        report = Report(
            company_id=company.id,
            fiscal_year=year,
            report_type=filing.form,
            accession_number=filing.accession_number,
            filing_date=filing.filing_date,
            report_date=filing.filing_date,
            filing_url=str(html_path),
        )

        self.report_repo.create(report)

        logger.info(
            "Stored report metadata."
        )

        # --------------------------------------------------
        # Return
        # --------------------------------------------------

        return IngestionResult(
            company=company.name,
            ticker=company.ticker,
            filing_type=filing.form,
            filing_date=filing.filing_date,
            sections=len(parsed_filing.sections),
            chunks=len(chunks),
            vectors=len(vectors),
            status="SUCCESS",
            message="Financial filing ingested successfully.",
        )

    # --------------------------------------------------
    # Backward Compatibility
    # --------------------------------------------------

    async def ingest(
        self,
        ticker: str,
        filing_type: str = "10-K",
    ) -> IngestionResult:

        company = await self.company_lookup.search(
            ticker
        )

        filing = await self.filing_lookup.latest_filing(
            cik=company.cik,
            form_type=filing_type,
        )

        if filing is None:
            raise ValueError(
                "No latest filing found."
            )

        year = int(
            filing.filing_date[:4]
        )

        return await self.ingest_year(
            ticker=ticker,
            year=year,
            filing_type=filing_type,
        )