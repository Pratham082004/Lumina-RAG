from dataclasses import dataclass
import logging

import httpx

logger = logging.getLogger(__name__)

USER_AGENT = "FinRAG AI contact@example.com"


@dataclass(slots=True)
class FilingInfo:
    form: str
    filing_date: str
    accession_number: str
    primary_document: str


class SECFilingLookup:

    BASE_URL = "https://data.sec.gov/submissions"

    def __init__(self) -> None:

        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }

        self.timeout = 30

    async def _fetch_recent_filings(
        self,
        cik: str,
    ) -> dict:

        url = f"{self.BASE_URL}/CIK{cik}.json"

        async with httpx.AsyncClient(
            headers=self.headers,
            timeout=self.timeout,
        ) as client:

            response = await client.get(url)

        response.raise_for_status()

        return response.json()["filings"]["recent"]

    async def get_filing(
        self,
        cik: str,
        year: int,
        form_type: str = "10-K",
    ) -> FilingInfo | None:
        """
        Returns the filing for a specific year.

        Example:
            get_filing("0000320193", 2024)
        """

        recent = await self._fetch_recent_filings(cik)

        forms = recent["form"]
        dates = recent["filingDate"]
        accessions = recent["accessionNumber"]
        documents = recent["primaryDocument"]

        for form, date, accession, document in zip(
            forms,
            dates,
            accessions,
            documents,
            strict=False,
        ):

            if form != form_type:
                continue

            filing_year = int(date[:4])

            if filing_year != year:
                continue

            logger.info(
                "Found %s filing for %s",
                form_type,
                year,
            )

            return FilingInfo(
                form=form,
                filing_date=date,
                accession_number=accession,
                primary_document=document,
            )

        logger.warning(
            "No %s filing found for %s (%s)",
            form_type,
            cik,
            year,
        )

        return None

    async def latest_filing(
        self,
        cik: str,
        form_type: str = "10-K",
    ) -> FilingInfo | None:
        """
        Returns the latest filing.
        """

        recent = await self._fetch_recent_filings(cik)

        forms = recent["form"]
        dates = recent["filingDate"]
        accessions = recent["accessionNumber"]
        documents = recent["primaryDocument"]

        for form, date, accession, document in zip(
            forms,
            dates,
            accessions,
            documents,
            strict=False,
        ):

            if form != form_type:
                continue

            return FilingInfo(
                form=form,
                filing_date=date,
                accession_number=accession,
                primary_document=document,
            )

        return None

    async def filings_between(
        self,
        cik: str,
        start_year: int,
        end_year: int,
        form_type: str = "10-K",
    ) -> list[FilingInfo]:
        """
        Returns all filings between two years (inclusive).
        """

        recent = await self._fetch_recent_filings(cik)

        forms = recent["form"]
        dates = recent["filingDate"]
        accessions = recent["accessionNumber"]
        documents = recent["primaryDocument"]

        filings: list[FilingInfo] = []

        for form, date, accession, document in zip(
            forms,
            dates,
            accessions,
            documents,
            strict=False,
        ):

            if form != form_type:
                continue

            filing_year = int(date[:4])

            if not (start_year <= filing_year <= end_year):
                continue

            filings.append(
                FilingInfo(
                    form=form,
                    filing_date=date,
                    accession_number=accession,
                    primary_document=document,
                )
            )

        filings.sort(
            key=lambda filing: filing.filing_date,
            reverse=True,
        )

        return filings