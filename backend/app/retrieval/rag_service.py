import logging

from app.retrieval.prompt_builder import PromptBuilder
from app.utils.time_parser import TimeParser

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

    async def _resolve_companies(self, question: str, session_id: str | None = None) -> list[dict]:
        resolved_companies = []
        try:
            if hasattr(self.company_resolver, "resolve_all"):
                resolved_companies = await self.company_resolver.resolve_all(question)
            else:
                single_comp = await self.company_resolver.resolve(question)
                if single_comp:
                    resolved_companies = [single_comp]
        except Exception:
            resolved_companies = []

        # If no company was resolved directly from question text, check chat session history
        if not resolved_companies and session_id:
            try:
                from app.database.session import SessionLocal
                from app.models.chat_session import ChatSession
                with SessionLocal() as db_session:
                    chat_sess = db_session.query(ChatSession).filter(ChatSession.id == session_id).first()
                    if chat_sess and chat_sess.messages:
                        for msg in reversed(chat_sess.messages):
                            if msg.role == "user" and msg.content and msg.content.strip() != question.strip():
                                prev_comps = await self.company_resolver.resolve_all(msg.content)
                                if prev_comps:
                                    resolved_companies = prev_comps
                                    logger.info(
                                        "Inferred active company from chat session history: %s",
                                        [c.get("ticker") for c in resolved_companies if isinstance(c, dict) and "ticker" in c]
                                    )
                                    break
            except Exception as hist_exc:
                logger.debug("Could not infer company from chat session history: %s", hist_exc)

        return resolved_companies

    async def ask(
        self,
        question: str,
        limit: int = 5,
        session_id: str | None = None,
        tickers: list[str] | None = None,
        is_comparison: bool = False,
    ):
        resolved_companies = await self._resolve_companies(question, session_id=session_id)

        if not resolved_companies and not session_id and not tickers:
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
            if len(tickers) > 1:
                is_comparison = True
        elif resolved_companies:
            resolved_tickers = [c["ticker"] for c in resolved_companies if "ticker" in c]
            logger.info("Resolved companies: %s", resolved_tickers)
            time_range = self.time_parser.parse(question)
            years = time_range.years

            if len(resolved_tickers) > 1:
                is_comparison = True
                search_ticker = resolved_tickers
                company_name = ", ".join([c.get("company", c.get("name", t)) for c, t in zip(resolved_companies, resolved_tickers)])
                for t in resolved_tickers:
                    await self.ingestion_manager.ensure_company_ready(ticker=t, years=years)
            else:
                search_ticker = resolved_tickers[0]
                company_name = resolved_companies[0].get("company", resolved_companies[0].get("name", search_ticker))
                await self.ingestion_manager.ensure_company_ready(ticker=search_ticker, years=years)

        # Retrieval
        retrieval = None
        if search_ticker:
            retrieval = await self.retrieval_service.search(
                question=question,
                ticker=search_ticker,
                limit=limit,
            )
        else:
            retrieval = await self.retrieval_service.search(
                question=question,
                limit=limit,
            )

        live_stock_data = None
        if isinstance(search_ticker, str):
            try:
                from app.api.stocks import fetch_stock_quote
                live_stock_data = await fetch_stock_quote(search_ticker)
            except Exception as exc:
                logger.debug("Could not fetch live stock quote for %s: %s", search_ticker, exc)

        prompt = self.prompt_builder.build(
            retrieval,
            is_comparison=is_comparison,
            live_stock_data=live_stock_data,
        )

        answer = await self.llm_service.generate(prompt)

        return {
            "company": company_name,
            "ticker": search_ticker,
            "question": question,
            "requested_years": years,
            "answer": answer,
            "sources": [
                {
                    "section": result.metadata.get("section"),
                    "filing_date": result.metadata.get("filing_date"),
                    "year": result.metadata.get("year"),
                    "score": result.score,
                }
                for result in (retrieval.results if retrieval else [])
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

        try:
            resolved_companies = await self._resolve_companies(question, session_id=session_id)

            if not resolved_companies and not session_id and not tickers:
                raise ValueError("Could not identify a company in your query and no custom document was provided.")

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
                if len(tickers) > 1:
                    is_comparison = True
            elif resolved_companies:
                resolved_tickers = [c["ticker"] for c in resolved_companies if "ticker" in c]
                logger.info("Resolved companies: %s", resolved_tickers)
                time_range = self.time_parser.parse(question)
                years = time_range.years

                if len(resolved_tickers) > 1:
                    is_comparison = True
                    search_ticker = resolved_tickers
                    company_name = ", ".join([c.get("company", c.get("name", t)) for c, t in zip(resolved_companies, resolved_tickers)])
                    for t in resolved_tickers:
                        await self.ingestion_manager.ensure_company_ready(ticker=t, years=years)
                else:
                    search_ticker = resolved_tickers[0]
                    company_name = resolved_companies[0].get("company", resolved_companies[0].get("name", search_ticker))
                    await self.ingestion_manager.ensure_company_ready(ticker=search_ticker, years=years)

            retrieval = None
            if search_ticker:
                retrieval = await self.retrieval_service.search(
                    question=question,
                    ticker=search_ticker,
                    limit=limit,
                )
            else:
                retrieval = await self.retrieval_service.search(
                    question=question,
                    limit=limit,
                )

            live_stock_data = None
            if isinstance(search_ticker, str):
                try:
                    from app.api.stocks import fetch_stock_quote
                    live_stock_data = await fetch_stock_quote(search_ticker)
                except Exception as exc:
                    logger.debug("Could not fetch live stock quote for %s: %s", search_ticker, exc)

            prompt = self.prompt_builder.build(
                retrieval,
                is_comparison=is_comparison,
                live_stock_data=live_stock_data,
            )

            sources_data = [
                {
                    "section": result.metadata.get("section"),
                    "filing_date": result.metadata.get("filing_date"),
                    "year": result.metadata.get("year"),
                    "score": result.score,
                }
                for result in (retrieval.results if retrieval else [])
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

        except Exception as exc:
            logger.exception("Unexpected error in ask_stream: %s", exc)
            yield f"data: {json.dumps({'type': 'chunk', 'content': f'I encountered an error processing your request: {str(exc)}'})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"