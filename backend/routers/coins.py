import copy
from fastapi import APIRouter, Query, HTTPException
from services.coingecko import fetch_coins
from services.connection import get_simulated_state

router = APIRouter()


@router.get("/api/coins")
async def get_coins(
    vs_currency: str = Query("usd"),
    per_page: int = Query(50),
    multiply: int = Query(1, ge=1, le=100),
):
    sim = get_simulated_state()

    # error 시뮬레이션: 서버 에러 반환
    if sim == "error":
        raise HTTPException(status_code=503, detail="Simulated connection error")

    coins = await fetch_coins(vs_currency=vs_currency, per_page=per_page)

    if multiply > 1:
        base = coins[:]
        for i in range(1, multiply):
            for coin in base:
                clone = copy.deepcopy(coin)
                clone["id"] = f"{coin['id']}-{i}"
                clone["name"] = f"{coin['name']} #{i+1}"
                coins.append(clone)

    # confirmed 시뮬레이션: 응답에 connection_status 추가
    if sim == "confirmed":
        return {"connection_status": "confirmed", "data": coins}

    # live (기본): 정상 응답
    return {"connection_status": "live", "data": coins}
