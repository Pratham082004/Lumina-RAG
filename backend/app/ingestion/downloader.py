from __future__ import annotations

import hashlib
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx

from app.config import settings
from app.ingestion.company_lookup import CompanyInfo
from app.ingestion.filing_lookup import FilingInfo

logger = logging.getLogger(__name__)

USER_AGENT = "FinRAG AI (contact@example.com)"


class SECDownloader:
    """
    Downloads SEC filings and stores them locally.

    Responsibilities
    ----------------
    - Build storage path
    - Reuse downloaded filings
    - Download missing filings
    - Save metadata
    """

    BASE_ARCHIVE = "https://www.sec.gov/Archives/edgar/data"

    def __init__(self):

        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "text/html",
        }

        self.timeout = 60

    # ---------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------

    def get_storage_path(
        self,
        company: CompanyInfo,
        filing: FilingInfo,
    ) -> Path:

        accession = filing.accession_number.replace("-", "")

        return (
            Path(settings.REPORT_STORAGE)
            / company.ticker
            / filing.filing_date[:4]
            / filing.form
            / accession
        )

    def is_downloaded(
        self,
        company: CompanyInfo,
        filing: FilingInfo,
    ) -> bool:

        html_path = (
            self.get_storage_path(company, filing)
            / "filing.html"
        )

        return html_path.exists()

    # ---------------------------------------------------------
    # Main API
    # ---------------------------------------------------------

    async def ensure_downloaded(
        self,
        company: CompanyInfo,
        filing: FilingInfo,
    ) -> Path:

        started = time.perf_counter()

        accession = filing.accession_number.replace("-", "")

        filing_url = (
            f"{self.BASE_ARCHIVE}/"
            f"{int(company.cik)}/"
            f"{accession}/"
            f"{filing.primary_document}"
        )

        save_dir = self.get_storage_path(
            company,
            filing,
        )

        save_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        html_path = save_dir / "filing.html"
        metadata_path = save_dir / "metadata.json"

        # ---------------------------------------------------------
        # Already downloaded
        # ---------------------------------------------------------

        if html_path.exists():

            logger.info(
                "Using cached filing %s",
                html_path,
            )

            return html_path

        # ---------------------------------------------------------
        # Download
        # ---------------------------------------------------------

        logger.info(
            "Downloading SEC filing from %s",
            filing_url,
        )

        async with httpx.AsyncClient(
            headers=self.headers,
            timeout=self.timeout,
            follow_redirects=True,
        ) as client:

            response = await client.get(
                filing_url
            )

        response.raise_for_status()

        if "<html" not in response.text.lower():

            raise ValueError(
                "Downloaded document is not valid HTML."
            )

        html_path.write_text(
            response.text,
            encoding="utf-8",
        )

        sha256 = hashlib.sha256(
            response.content
        ).hexdigest()

        metadata = {
            "company": company.name,
            "ticker": company.ticker,
            "cik": company.cik,
            "year": int(filing.filing_date[:4]),
            "form": filing.form,
            "filing_date": filing.filing_date,
            "accession_number": filing.accession_number,
            "primary_document": filing.primary_document,
            "download_url": filing_url,
            "local_path": str(html_path),
            "file_size": html_path.stat().st_size,
            "sha256": sha256,
            "downloaded_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "download_time_seconds": round(
                time.perf_counter() - started,
                3,
            ),
            "status": "DOWNLOADED",
        }

        metadata_path.write_text(
            json.dumps(
                metadata,
                indent=4,
            ),
            encoding="utf-8",
        )

        logger.info(
            "Downloaded %s (%d KB)",
            html_path,
            metadata["file_size"] // 1024,
        )

        return html_path

    # ---------------------------------------------------------
    # Compatibility Wrapper
    # ---------------------------------------------------------

    async def download(
        self,
        company: CompanyInfo,
        filing: FilingInfo,
    ) -> Path:
        """
        Backward compatibility.

        Existing code calling download()
        will continue to work.
        """

        return await self.ensure_downloaded(
            company,
            filing,
        )