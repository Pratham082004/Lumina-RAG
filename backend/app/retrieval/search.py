import logging

from app.retrieval.models import (
    RetrievalResult,
    SearchResult,
)

logger = logging.getLogger(__name__)


class RetrievalService:

    def __init__(
        self,
        embedding_service,
        vector_store,
    ):
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    async def search(
        self,
        question: str,
        ticker: str | None = None,
        years: list[int] | None = None,
        filing_type: str | None = None,
        section: str | None = None,
        limit: int = 5,
    ) -> RetrievalResult:
        """
        Search ChromaDB using semantic similarity
        with optional metadata filters.
        """

        logger.info(
            "Searching for question: %s",
            question,
        )

        # --------------------------------------------------
        # Embed query
        # --------------------------------------------------

        query_vector = await self.embedding_service.embed(
            question
        )

        # --------------------------------------------------
        # Metadata Filter
        # --------------------------------------------------

        where = {}

        if ticker:
            where["ticker"] = ticker

        if years:

            if len(years) == 1:
                where["year"] = years[0]

            else:
                where["year"] = {
                    "$in": years
                }

        if filing_type:
            where["filing_type"] = filing_type

        if section:
            where["section"] = section

        logger.info(
            "Metadata Filter: %s",
            where,
        )

        # --------------------------------------------------
        # Search Vector Store
        # --------------------------------------------------

        raw_results = await self.vector_store.search(
            vector=query_vector,
            where=where if where else None,
            limit=limit,
        )

        documents = raw_results.get(
            "documents",
            [[]],
        )[0]

        metadatas = raw_results.get(
            "metadatas",
            [[]],
        )[0]

        distances = raw_results.get(
            "distances",
            [[]],
        )[0]

        results = []

        for document, metadata, distance in zip(
            documents,
            metadatas,
            distances,
            strict=False,
        ):

            similarity = max(
                0.0,
                1.0 - distance,
            )

            results.append(
                SearchResult(
                    text=document,
                    metadata=metadata,
                    score=similarity,
                )
            )

        logger.info(
            "Retrieved %d chunks",
            len(results),
        )

        return RetrievalResult(
            question=question,
            results=sorted(
                results,
                key=lambda r: r.score,
                reverse=True,
            ),
        )