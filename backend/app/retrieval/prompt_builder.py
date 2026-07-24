from app.retrieval.models import RetrievalResult


class PromptBuilder:
    """
    Builds the prompt for the LLM using retrieved SEC filing chunks.
    """

    SYSTEM_PROMPT = """
You are an expert financial analyst specializing in SEC filings.

You MUST answer ONLY using the provided filing excerpts.

Rules:
1. Never invent or assume information.
2. If the answer cannot be found, respond:
   "I couldn't find that information in the provided filing."
3. When mentioning financial figures, preserve the exact numbers.
4. Mention the filing year whenever relevant.
5. If multiple years are provided, compare them when appropriate.
6. Cite the section(s) used in your answer.
7. Keep answers concise, factual, and professional.
"""

    def build(
        self,
        retrieval: RetrievalResult,
    ) -> str:

        context_blocks = []

        for index, result in enumerate(
            retrieval.results,
            start=1,
        ):

            metadata = result.metadata

            context_blocks.append(
                f"""
========== Document {index} ==========
Company        : {metadata.get("company", "Unknown")}
Ticker         : {metadata.get("ticker", "Unknown")}
Year           : {metadata.get("year", "Unknown")}
Filing Type    : {metadata.get("filing_type", "Unknown")}
Section        : {metadata.get("section", "Unknown")}
Accession No.  : {metadata.get("accession_number", "Unknown")}

Content:
{result.text}
"""
            )

        context = "\n".join(context_blocks)

        return f"""
{self.SYSTEM_PROMPT}

===========================================================
QUESTION
===========================================================

{retrieval.question}

===========================================================
CONTEXT
===========================================================

{context}

===========================================================
ANSWER
===========================================================
"""