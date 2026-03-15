import asyncio
import random
from fastapi import APIRouter
from pydantic import BaseModel
from services.connection import get_simulated_state

router = APIRouter()

class ConfirmRequest(BaseModel):
    force_result: str | None = None

@router.post("/api/confirm/{coin_id}")
async def confirm_coin(coin_id: str, body: ConfirmRequest | None = None):
    await asyncio.sleep(random.uniform(0.6, 1.2))

    sim = get_simulated_state()

    # 시뮬레이션 상태에 따라 결과 강제
    if sim == "error":
        status = "failed"
    elif sim == "confirmed":
        status = "confirmed"
    elif body and body.force_result:
        status = body.force_result
    else:
        status = "confirmed" if random.random() < 0.7 else "failed"

    return {"coin_id": coin_id, "status": status}
