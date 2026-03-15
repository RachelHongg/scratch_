from fastapi import APIRouter
from pydantic import BaseModel
from services.connection import get_simulated_state, set_simulated_state, reset_simulated_state

router = APIRouter()


class SimulateRequest(BaseModel):
    state: str  # "live" | "error" | "confirmed"


@router.post("/api/connection/simulate")
async def simulate(body: SimulateRequest):
    if body.state not in ("live", "error", "confirmed"):
        return {"error": "state must be one of: live, error, confirmed"}
    set_simulated_state(body.state)  # type: ignore
    return {"status": "ok", "simulated_state": body.state}


@router.post("/api/connection/reset")
async def reset():
    reset_simulated_state()
    return {"status": "ok", "simulated_state": None}


@router.get("/api/connection/state")
async def get_state():
    return {"simulated_state": get_simulated_state()}
