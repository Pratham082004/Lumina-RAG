import re
import httpx

SEC_COMPANY_TICKERS_URL = (
    "https://www.sec.gov/files/company_tickers.json"
)

USER_AGENT = "Lumina Finance contact@example.com"

# Words that should NEVER become aliases
STOP_WORDS = {
    "the", "and", "for", "with", "from", "into", "onto",
    "what", "when", "where", "which", "who", "why", "how",
    "are", "is", "was", "were", "be", "been", "being",
    "does", "did", "do", "have", "has", "had",
    "can", "could", "should", "would", "will", "shall",
    "this", "that", "these", "those",

    # Generic business & financial words
    "group", "holding", "holdings",
    "international", "global",
    "capital", "financial", "financials", "finance",
    "energy", "resources",
    "technology", "technologies",
    "systems", "services", "solutions",
    "industries", "industrial",
    "medical", "health", "healthcare",
    "real", "estate",
    "trust", "fund", "bank",
    "company", "corporation", "corp",
    "inc", "limited", "ltd",
    "stock", "stocks", "price", "prices", "share", "shares",
    "market", "markets", "exchange", "exchanges",
    "revenue", "revenues", "earnings", "profit", "profits",
    "income", "loss", "losses", "growth", "sales", "margin", "margins",
    "report", "reports", "filing", "filings", "asset", "assets",
    "debt", "debts", "equity", "cash", "flow", "flows",
    "dividend", "dividends", "investor", "investors", "investment", "investments",
    "stockholder", "stockholders", "shareholder", "shareholders",
    "quarter", "quarterly", "annual", "year", "yearly", "fiscal",
}


class CompanyCache:
    """
    Loads the SEC company list into memory and builds
    fast lookup indexes for company resolution.
    """

    def __init__(self):

        self.loaded = False

        self.company_to_ticker = {}
        self.ticker_to_company = {}
        self.aliases = {}
        self.company_records = []

    async def load(self):

        if self.loaded:
            return

        async with httpx.AsyncClient(
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            },
            timeout=30,
        ) as client:

            response = await client.get(
                SEC_COMPANY_TICKERS_URL
            )

        response.raise_for_status()

        companies = response.json()

        for company in companies.values():

            ticker = company["ticker"].upper()

            company_name = company["title"].strip()

            record = {
                "ticker": ticker,
                "company": company_name,
                "cik": str(company["cik_str"]).zfill(10),
            }

            self.company_records.append(record)

            self.company_to_ticker[
                company_name.lower()
            ] = ticker

            self.ticker_to_company[
                ticker
            ] = record

            aliases = {
                company_name.lower(),
            }

            cleaned = re.sub(
                r"\b(inc|inc\.|corp|corp\.|corporation|company|co|co\.|limited|ltd|ltd\.|plc)\b",
                "",
                company_name.lower(),
            )

            cleaned = re.sub(
                r"[^\w\s]",
                "",
                cleaned,
            )

            cleaned = " ".join(
                cleaned.split()
            )

            aliases.add(cleaned)

            words = re.findall(
                r"[a-z0-9]+",
                cleaned,
            )

            for word in words:

                if len(word) < 4:
                    continue

                if word in STOP_WORDS:
                    continue

                aliases.add(word)

            for alias in aliases:

                self.aliases.setdefault(
                    alias,
                    record,
                )

        # Manual aliases
        manual_aliases = {
            "apple": "AAPL",
            "microsoft": "MSFT",
            "google": "GOOGL",
            "alphabet": "GOOGL",
            "facebook": "META",
            "meta": "META",
            "amazon": "AMZN",
            "nvidia": "NVDA",
            "tesla": "TSLA",
            "netflix": "NFLX",
        }

        for alias, ticker in manual_aliases.items():

            if ticker in self.ticker_to_company:
                self.aliases[alias] = (
                    self.ticker_to_company[ticker]
                )

        self.loaded = True

        print(f"Loaded {len(self.company_records)} SEC companies.")
        print(f"Built {len(self.aliases)} aliases.")
        print("Apple alias:", self.aliases.get("apple"))
        print("Alias 'are':", self.aliases.get("are"))
