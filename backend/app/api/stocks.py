import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()


async def fetch_stock_quote(ticker: str) -> dict:
    clean_ticker = ticker.strip().lstrip("$").upper()
    if not clean_ticker:
        raise ValueError("Invalid stock ticker provided.")

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{clean_ticker}?range=1mo&interval=1d"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
    }

    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(url, headers=headers, timeout=10.0)
        if response.status_code != 200:
            fallback_url = f"https://query2.finance.yahoo.com/v8/finance/chart/{clean_ticker}?range=1mo&interval=1d"
            response = await client.get(fallback_url, headers=headers, timeout=10.0)

        response.raise_for_status()

        data = response.json()
        chart_obj = data.get("chart", {})
        result = chart_obj.get("result")

        if not result or not isinstance(result, list) or len(result) == 0 or result[0] is None:
            err_info = chart_obj.get("error", {})
            detail_msg = err_info.get("description") if isinstance(err_info, dict) else None
            raise ValueError(detail_msg or f"Ticker '{clean_ticker}' not found or no data available")

        chart_data = result[0]
        timestamps = chart_data.get("timestamp") or []
        quote_list = chart_data.get("indicators", {}).get("quote", [])
        indicators = quote_list[0] if (quote_list and isinstance(quote_list, list) and quote_list[0]) else {}
        close_prices = indicators.get("close") or []

        formatted_data = []
        for t, p in zip(timestamps, close_prices):
            if t is not None and p is not None:
                formatted_data.append({
                    "date": t * 1000,
                    "price": round(float(p), 2)
                })

        if not formatted_data:
            raise ValueError(f"No valid price data available for ticker '{clean_ticker}'")

        meta = chart_data.get("meta", {})
        regularMarketPrice = meta.get("regularMarketPrice") or (formatted_data[-1]["price"] if formatted_data else 0)
        previousClose = meta.get("previousClose") or meta.get("chartPreviousClose") or (formatted_data[-2]["price"] if len(formatted_data) > 1 else regularMarketPrice)

        return {
            "ticker": clean_ticker,
            "currentPrice": round(float(regularMarketPrice), 2),
            "previousClose": round(float(previousClose), 2),
            "chart": formatted_data
        }


@router.get("/{ticker}")
async def get_stock_data(ticker: str):
    try:
        return await fetch_stock_quote(ticker)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


