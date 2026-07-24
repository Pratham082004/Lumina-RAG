import logging

from app.utils.time_parser import TimeParser
from app.retrieval.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)


class RAGService:

    def __init__(
        self,
        retrieval_service,
        llm_service,
        company_resolver,
        ingestion_manager,
    ):
        self.retrieval_service = retrieval_service
        self.prompt_builder = PromptBuilder()
        self.llm_service = llm_service
        self.company_resolver = company_resolver
        self.ingestion_manager = ingestion_manager
        self.time_parser = TimeParser()

    async def ask(
        self,
        question: str,
        limit: int = 5,
    ):

        # --------------------------------------------------
        # Resolve Company
        # --------------------------------------------------

        company = await self.company_resolver.resolve(
            question
        )

        if company is None:
            raise ValueError(
                "Could not identify a company."
            )

        ticker = company["ticker"]

        logger.info(
            "Resolved company: %s",
            ticker,
        )

        # --------------------------------------------------
        # Parse Time Range
        # --------------------------------------------------

        time_range = self.time_parser.parse(
            question
        )

        years = time_range.years

        logger.info(
            "Requested years: %s",
            years,
        )

        # --------------------------------------------------
        # Auto Ingestion
        # --------------------------------------------------

        await self.ingestion_manager.ensure_company_ready(
            ticker=ticker,
            years=years,
        )

        # --------------------------------------------------
        # Retrieval
        # --------------------------------------------------

        retrieval = await self.retrieval_service.search(
            question=question,
            ticker=ticker,
            limit=limit,
        )

        # --------------------------------------------------
        # Prompt
        # --------------------------------------------------

        prompt = self.prompt_builder.build(
            retrieval
        )

        # --------------------------------------------------
        # LLM
        # --------------------------------------------------

        answer = await self.llm_service.generate(
            prompt
        )

        # --------------------------------------------------
        # Response
        # --------------------------------------------------

        return {
            "company": company["company"],
            "ticker": ticker,
            "question": question,
            "requested_years": years,
            "answer": answer,
            "sources": [
                {
                    "section": result.metadata.get(
                        "section"
                    ),
                    "filing_date": result.metadata.get(
                        "filing_date"
                    ),
                    "year": result.metadata.get(
                        "year"
                    ),
                    "score": result.score,
                }
                for result in retrieval.results
            ],
        }