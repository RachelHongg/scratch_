import { createContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { ConfirmState, ConfirmAction } from '../types/confirm';

interface ConfirmContextValue {
  confirmStates: ConfirmState;
  dispatch: Dispatch<ConfirmAction>;
}

function confirmReducer(state: ConfirmState, action: ConfirmAction): ConfirmState {
  switch (action.type) {
    case 'START': return { ...state, [action.coinId]: 'pending' };
    case 'SUCCESS': return { ...state, [action.coinId]: 'confirmed' };
    case 'FAIL': return { ...state, [action.coinId]: 'failed' };
    case 'RESET': return { ...state, [action.coinId]: 'idle' };
    case 'RESET_ALL': return {};
    default: return state;
  }
}

export const ConfirmContext = createContext<ConfirmContextValue>({
  confirmStates: {},
  dispatch: () => {},
});

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmStates, dispatch] = useReducer(confirmReducer, {});
  return (
    <ConfirmContext.Provider value={{ confirmStates, dispatch }}>
      {children}
    </ConfirmContext.Provider>
  );
}
