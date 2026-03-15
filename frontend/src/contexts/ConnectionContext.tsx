import { createContext, type Dispatch, type ReactNode } from 'react';
import { useConnectionMachine } from '../hooks/useConnectionMachine';
import type { ConnectionState, ConnectionAction } from '../types/connection';

interface ConnectionContextValue {
  state: ConnectionState;
  dispatch: Dispatch<ConnectionAction>;
}

export const ConnectionContext = createContext<ConnectionContextValue>({
  state: 'connecting',
  dispatch: () => {},
});

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useConnectionMachine();
  return (
    <ConnectionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConnectionContext.Provider>
  );
}
