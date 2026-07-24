from __future__ import annotations

import logging
from typing import Iterable

logger = logging.getLogger(__name__)


class IngestionManager:

    def __init__(
        self,
        pipeline,
        report_repo,
        company_lookup,
        company_repo,
    ):
        self.pipeline = pipeline
        self.report_repo = report_repo
        self.company_lookup = company_lookup
        self.company_repo = company_repo

    async def ensure_company_ready(
        self,
        ticker: str,
        years: Iterable[int],
        filing_type: str = "10-K",
    ):

        company_info = await self.company_lookup.search(
            ticker
        )

        if company_info is None:
            raise ValueError(
                f"Company '{ticker}' not found."
            )

        company = self.company_repo.get_or_create_by_ticker(
            ticker=company_info.ticker,
            name=company_info.name,
            cik=company_info.cik,
        )

        existing = self.report_repo.available_years(
            company.id,
            filing_type,
        )

        requested = set(years)

        missing = sorted(
            requested - existing,
            reverse=True,
        )

        logger.info(
            "Existing years: %s",
            sorted(existing),
        )

        logger.info(
            "Missing years: %s",
            missing,
        )

        results = []

        for year in missing:

            result = await self.pipeline.ingest_year(
                ticker=ticker,
                year=year,
                filing_type=filing_type,
            )

            results.append(result)

        return results