import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/{ticker}")
async def get_stock_data(ticker: str):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=1mo&interval=1d"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10.0)
            response.raise_for_status()
            
            data = response.json()
            
            result = data.get("chart", {}).get("result", [])
            if not result:
                raise HTTPException(status_code=404, detail="Ticker not found or no data available")
                
            chart_data = result[0]
            timestamps = chart_data.get("timestamp", [])
            indicators = chart_data.get("indicators", {}).get("quote", [{}])[0]
            close_prices = indicators.get("close", [])
            
            # Filter out null values
            formatted_data = []
            for t, p in zip(timestamps, close_prices):
                if p is not None:
                    formatted_data.append({
                        "date": t * 1000, # Convert to milliseconds for JS date parsing if needed
                        "price": round(p, 2)
                    })
                    
            if not formatted_data:
                raise HTTPException(status_code=404, detail="No valid price data available")

            # Get meta info for current price / previous close
            meta = chart_data.get("meta", {})
            regularMarketPrice = meta.get("regularMarketPrice", 0)
            previousClose = meta.get("previousClose", 0)
            
            return {
                "ticker": ticker.upper(),
                "currentPrice": regularMarketPrice,
                "previousClose": previousClose,
                "chart": formatted_data
            }
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Failed to fetch from Yahoo Finance: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
