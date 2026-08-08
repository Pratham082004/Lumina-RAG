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
        session_id: str | None = None,
        tickers: list[str] | None = None,
        is_comparison: bool = False,
    ):
        
        # Check if there are custom documents for this session first
        retrieval = None
        if session_id:
            # Check if we have documents for this session
            try:
                retrieval = await self.retrieval_service.search(
                    question=question,
                    section=None,
                    limit=limit,
                )
                # Filter results in memory for now to see if any match the session_id
                # Actually, our retrieval_service search doesn't take accession_number filter natively in search.py
                # Let's just do a vector search and filter post-hoc, or better yet, we pass a raw `where` to search if we could.
                pass
            except Exception:
                pass

        # If we really want to query custom documents, we should probably update `retrieval_service.search` to accept `accession_number` filter.
        # Let's assume we will just use the standard flow and if it resolves a company, it uses it.
        # But wait, if they say "summarize my document", the company resolver will fail.

        # Let's try to bypass company resolution if session_id is provided and the question might be about the document.
        try:
            company = await self.company_resolver.resolve(question)
            resolved_ticker = company["ticker"] if company else None
        except Exception:
            company = None
            resolved_ticker = None

        if not company and not session_id and not tickers:
            raise ValueError("Could not identify a company and no custom document provided.")

        years = []
        company_name = None
        search_ticker = None

        if tickers:
            logger.info("Explicit tickers provided: %s", tickers)
            time_range = self.time_parser.parse(question)
            years = time_range.years
            for t in tickers:
                await self.ingestion_manager.ensure_company_ready(ticker=t, years=years)
            search_ticker = tickers
            company_name = ", ".join(tickers)
        elif company:
            logger.info("Resolved company: %s", resolved_ticker)
            time_range = self.time_parser.parse(question)
            years = time_range.years
            logger.info("Requested years: %s", years)
            await self.ingestion_manager.ensure_company_ready(ticker=resolved_ticker, years=years)
            search_ticker = resolved_ticker
            company_name = company["company"]

        # Retrieval
        if search_ticker:
            retrieval = await self.retrieval_service.search(
                question=question,
                ticker=search_ticker,
                limit=limit,
            )
        elif session_id:
            # We need to search by session_id. Our search.py doesn't have accession_number filter exposed directly, 
            # so we'll just search globally and filter by accession_number, or we can just add accession_number to search.py
            # For simplicity without changing search.py again:
            raw_results = await self.retrieval_service.vector_store.search(
                vector=await self.retrieval_service.embedding_service.embed(question),
                where={"accession_number": session_id},
                limit=limit,
            )
            # Reconstruct RetrievalResult manually
            from app.retrieval.models import RetrievalResult, SearchResult
            docs = raw_results.get("documents", [[]])[0]
            metas = raw_results.get("metadatas", [[]])[0]
            dists = raw_results.get("distances", [[]])[0]
            results = []
            for d, m, dist in zip(docs, metas, dists, strict=False):
                results.append(SearchResult(text=d, metadata=m, score=max(0.0, 1.0 - dist)))
            retrieval = RetrievalResult(question=question, results=sorted(results, key=lambda r: r.score, reverse=True))

        # --------------------------------------------------
        # Prompt
        # --------------------------------------------------

        prompt = self.prompt_builder.build(
            retrieval,
            is_comparison=is_comparison
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
            "company": company_name,
            "ticker": search_ticker,
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

    async def ask_stream(
        self,
        question: str,
        limit: int = 5,
        session_id: str | None = None,
        tickers: list[str] | None = None,
        is_comparison: bool = False,
    ):
        import json
        
        retrieval = None
        if session_id:
            try:
                retrieval = await self.retrieval_service.search(
                    question=question,
                    section=None,
                    limit=limit,
                )
            except Exception:
                pass

        try:
            company = await self.company_resolver.resolve(question)
            resolved_ticker = company["ticker"] if company else None
        except Exception:
            company = None
            resolved_ticker = None

        if not company and not session_id and not tickers:
            raise ValueError("Could not identify a company and no custom document provided.")

        years = []
        company_name = None
        search_ticker = None

        if tickers:
            logger.info("Explicit tickers provided: %s", tickers)
            time_range = self.time_parser.parse(question)
            years = time_range.years
            for t in tickers:
                await self.ingestion_manager.ensure_company_ready(ticker=t, years=years)
            search_ticker = tickers
            company_name = ", ".join(tickers)
        elif company:
            logger.info("Resolved company: %s", resolved_ticker)
            time_range = self.time_parser.parse(question)
            years = time_range.years
            logger.info("Requested years: %s", years)
            await self.ingestion_manager.ensure_company_ready(ticker=resolved_ticker, years=years)
            search_ticker = resolved_ticker
            company_name = company["company"]

        if search_ticker:
            retrieval = await self.retrieval_service.search(
                question=question,
                ticker=search_ticker,
                limit=limit,
            )
        elif session_id:
            raw_results = await self.retrieval_service.vector_store.search(
                vector=await self.retrieval_service.embedding_service.embed(question),
                where={"accession_number": session_id},
                limit=limit,
            )
            from app.retrieval.models import RetrievalResult, SearchResult
            docs = raw_results.get("documents", [[]])[0]
            metas = raw_results.get("metadatas", [[]])[0]
            dists = raw_results.get("distances", [[]])[0]
            results = []
            for d, m, dist in zip(docs, metas, dists, strict=False):
                results.append(SearchResult(text=d, metadata=m, score=max(0.0, 1.0 - dist)))
            retrieval = RetrievalResult(question=question, results=sorted(results, key=lambda r: r.score, reverse=True))

        prompt = self.prompt_builder.build(retrieval, is_comparison=is_comparison)

        sources_data = [
            {
                "section": result.metadata.get("section"),
                "filing_date": result.metadata.get("filing_date"),
                "year": result.metadata.get("year"),
                "score": result.score,
            }
            for result in retrieval.results
        ]

        metadata_payload = {
            "type": "metadata",
            "company": company_name,
            "ticker": search_ticker,
            "requested_years": years,
            "sources": sources_data
        }
        yield f"data: {json.dumps(metadata_payload)}\n\n"

        async for chunk in self.llm_service.generate_stream(prompt):
            chunk_payload = {
                "type": "chunk",
                "content": chunk
            }
            yield f"data: {json.dumps(chunk_payload)}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"