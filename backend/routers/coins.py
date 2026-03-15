import copy
from fastapi import APIRouter, Query
from services.coingecko import fetch_coins

router = APIRouter()

@router.get("/api/coins")
async def get_coins(
    vs_currency: str = Query("usd"),
    per_page: int = Query(50),
    multiply: int = Query(1, ge=1, le=100),
):
    coins = await fetch_coins(vs_currency=vs_currency, per_page=per_page)
    if multiply > 1:
        base = coins[:]
        for i in range(1, multiply):
            for coin in base:
                clone = copy.deepcopy(coin)
                clone["id"] = f"{coin['id']}-{i}"
                clone["name"] = f"{coin['name']} #{i+1}"
                coins.append(clone)
    return coins
