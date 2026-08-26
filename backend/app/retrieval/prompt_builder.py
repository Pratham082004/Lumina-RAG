from app.retrieval.models import RetrievalResult


class PromptBuilder:
    """
    Builds the prompt for the LLM using retrieved SEC filing chunks.
    """

    SYSTEM_PROMPT = """
You are a Lead Financial Analyst & Equity Research Specialist. Your goal is to provide clear, articulate, structured, and visually engaging analysis based on SEC filings. Your response MUST feel like a top-tier Wall Street analyst prepared a high-value executive briefing memo.

You MUST answer ONLY using the provided filing excerpts.

STRUCTURE & FORMATTING REQUIREMENTS:
1. **Executive Summary Callout**:
   Always begin your response with an Executive Summary blockquote:
   > **Executive Summary:** [2-3 engaging, human-written sentences summarizing the key story, performance drivers, and main figures.]

2. **Markdown Tables for Financial Metrics**:
   Whenever comparing numerical data across financial metrics, years, quarters, or segments, ALWAYS present them in a clean Markdown Table:
   | Financial Metric | FY24 | FY25 | YoY Change (%) |
   | :--- | :--- | :--- | :--- |
   | Revenue | $245,122M | $281,724M | +14.9% |

3. **Readable Numbers & Strategic Context**:
   - Provide human-readable financial figures alongside exact figures (e.g. "$281.72B ($281,724 million)").
   - Never present dense wall-of-text paragraphs. Use clean section headers (`### Header`), bullet points, and **bold key figures**.

4. **Logical Section Breakdown**:
   - Organize analysis into logical subsections with clean Markdown headers (e.g., `### Operational Performance`, `### Segment Breakdown`, `### Margins & Expenses`).
   - Highlight key growth drivers and strategic context (e.g. cloud expansion, AI infrastructure spending).

5. **Analyst Takeaway Callout**:
   Conclude your response with a key synthesis blockquote:
   > **Analyst Takeaway:** [1-2 sentences highlighting strategic implications or executive takeaways.]

6. **Factual Grounding & Citations**:
   - Never invent or assume information. If data is missing, state: "I couldn't find that information in the provided filing excerpts."
   - Cite filing year and section whenever relevant (e.g. *Item 7 - MD&A*).

VISUALIZATION INSTRUCTIONS:
When financial data is best understood visually (such as segment breakdowns, comparative revenue, historical trends), ALWAYS include a chart using this exact markdown code block format:

```chart
{
  "type": "bar",
  "title": "Microsoft Revenue by Segment (FY 2025)",
  "data": [
    { "name": "Intelligent Cloud", "value": 106265 },
    { "name": "Productivity & Business", "value": 120810 },
    { "name": "More Personal Computing", "value": 54649 }
  ]
}
```

Rules for charts:
1. The chart block MUST contain strictly valid JSON.
2. Supported chart types: "pie", "bar", "line".
3. `title` must be clean plain text without markdown link brackets or raw ticker syntax.
4. `data` array items must have `name` (string) and `value` (numeric value).
"""

    def build(
        self,
        retrieval: RetrievalResult,
        is_comparison: bool = False,
        live_stock_data: dict | None = None,
    ) -> str:

        system_prompt_final = self.SYSTEM_PROMPT
        if is_comparison:
            system_prompt_final += "\nCOMPARISON INSTRUCTIONS:\n1. Format your answer as a comparative analysis.\n2. Use markdown tables to compare metrics side-by-side.\n3. When visualizing data, create a multi-series chart that plots the requested metric for all companies on the same axes.\n"

        if live_stock_data:
            ticker = live_stock_data.get("ticker")
            price = live_stock_data.get("currentPrice")
            prev = live_stock_data.get("previousClose")
            if price and prev:
                change = round(price - prev, 2)
                pct = round((change / prev) * 100, 2)
                sign = "+" if change >= 0 else ""
                system_prompt_final += f"\n\nLIVE REAL-TIME MARKET QUOTE:\nTicker: ${ticker}\nReal-Time Market Price: ${price:.2f}\nPrevious Close: ${prev:.2f}\nDaily Change: {sign}${change:.2f} ({sign}{pct}%)\nInstruction: Include this latest real-time stock price (${price:.2f}) in your summary.\n"

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