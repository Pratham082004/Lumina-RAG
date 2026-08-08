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

VISUALIZATION INSTRUCTIONS:
When the user asks for financial data that would be best represented visually (such as a breakdown, comparison, historical trend, or proportions), you MUST provide a chart using the following specific markdown format.

Always wrap the chart data in a markdown code block tagged with `chart`. The contents of the block must be valid, parseable JSON.

Supported chart types are: "pie", "bar", and "line".

Format Example:
```chart
{
  "type": "bar",
  "title": "Quarterly Revenue Comparison",
  "data": [
    { "name": "Q1", "value": 150 },
    { "name": "Q2", "value": 180 },
    { "name": "Q3", "value": 160 }
  ]
}
```

Rules for charts:
1. Ensure the JSON is strictly valid (use double quotes for keys).
2. The `data` array must contain objects with `name` (for the x-axis or category) and `value` (for the y-axis or metric) keys.
3. Include a descriptive `title`.
4. You may include regular text explanations before or after the chart block to provide context.
"""

    def build(
        self,
        retrieval: RetrievalResult,
        is_comparison: bool = False,
    ) -> str:

        system_prompt_final = self.SYSTEM_PROMPT
        if is_comparison:
            system_prompt_final += "\nCOMPARISON INSTRUCTIONS:\n1. Format your answer as a comparative analysis.\n2. Use markdown tables to compare metrics side-by-side.\n3. When visualizing data, create a multi-series chart that plots the requested metric for all companies on the same axes.\n"

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
{system_prompt_final}

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