import re


class CompanyResolver:
    """
    Resolves a company mentioned in a user's question.

    Resolution order:
    1. Full company name
    2. Alias
    3. Explicit ticker
    """

    def __init__(self, cache):
        self.cache = cache

    async def resolve(self, question: str):

        if not self.cache.loaded:
            await self.cache.load()

        original_question = question.strip()
        normalized_question = original_question.lower()

        print("=" * 60)
        print("Original Question :", original_question)
        print("Normalized        :", normalized_question)

        # ------------------------------------
        # Tokenization
        # ------------------------------------

        words = re.findall(r"[a-z0-9']+", normalized_question)

        # Convert Apple's -> apple
        words = [
            word[:-2] if word.endswith("'s") else word
            for word in words
        ]

        print("Words             :", words)

        # ------------------------------------
        # 1. Manual / High-Priority Aliases
        # ------------------------------------
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

        for word in words:
            if word in manual_aliases:
                ticker = manual_aliases[word]
                if ticker in self.cache.ticker_to_company:
                    print("Matched Manual Alias:", word, "->", ticker)
                    return self.cache.ticker_to_company[ticker]

        # ------------------------------------
        # 2. Full company name
        # ------------------------------------

        for company_name, ticker in self.cache.company_to_ticker.items():

            if company_name in normalized_question:
                print("Matched Full Name :", company_name)
                return self.cache.ticker_to_company[ticker]

        # ------------------------------------
        # 3. Alias lookup
        # ------------------------------------

        for word in words:

            if word in self.cache.aliases:
                print("Matched Alias     :", word)
                return self.cache.aliases[word]

        # ------------------------------------
        # 3. Explicit ticker lookup
        # ------------------------------------

        ticker_tokens = re.findall(
            r"\b[A-Z]{1,5}\b",
            original_question,
        )

        print("Ticker Tokens     :", ticker_tokens)

        for token in ticker_tokens:

            token = token.upper()

            if token in self.cache.ticker_to_company:
                print("Matched Ticker    :", token)
                return self.cache.ticker_to_company[token]

        print("No company matched.")
        print("=" * 60)

        return None