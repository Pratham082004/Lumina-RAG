from dataclasses import dataclass
import logging

import httpx

logger = logging.getLogger(__name__)

SEC_COMPANY_TICKERS_URL = (
    "https://www.sec.gov/files/company_tickers.json"
)

USER_AGENT = (
    "Lumina Finance contact@example.com"
)


@dataclass(slots=True)
class CompanyInfo:
    cik: str
    ticker: str
    name: str


class SECCompanyLookup:

    def __init__(self) -> None:

        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }

        self.timeout = 30

    async def search(
        self,
        query: str,
    ) -> CompanyInfo | None:
        """
        Search a company by ticker or company name.

        Examples:
            AAPL
            MSFT
            Apple
            Microsoft
        """

        query = query.strip().lower()

        async with httpx.AsyncClient(
            headers=self.headers,
            timeout=self.timeout,
        ) as client:

            response = await client.get(
                SEC_COMPANY_TICKERS_URL
            )

        response.raise_for_status()

        companies = response.json()

        for company in companies.values():

            ticker = company["ticker"].lower()
            title = company["title"].lower()

            if query == ticker or query in title:

                logger.info(
                    "Found company %s (%s)",
                    company["title"],
                    company["ticker"],
                )

                return CompanyInfo(
                    cik=str(company["cik_str"]).zfill(10),
                    ticker=company["ticker"],
                    name=company["title"],
                )

        logger.warning(
            "Company '%s' not found.",
            query,
        )

        return None