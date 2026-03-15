from typing import Literal

SimulatedState = Literal["live", "error", "confirmed"] | None

_simulated_state: SimulatedState = None


def get_simulated_state() -> SimulatedState:
    return _simulated_state


def set_simulated_state(state: SimulatedState) -> None:
    global _simulated_state
    _simulated_state = state


def reset_simulated_state() -> None:
    global _simulated_state
    _simulated_state = None
