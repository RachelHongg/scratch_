import httpx
from fastapi import HTTPException

async def fetch_coins(vs_currency: str = "usd", per_page: int = 50) -> list[dict]:
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": vs_currency,
        "order": "market_cap_desc",
        "per_page": per_page,
        "sparkline": "false",
        "price_change_percentage": "24h",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, httpx.TimeoutException):
            raise HTTPException(status_code=503, detail="Upstream API unavailable")
