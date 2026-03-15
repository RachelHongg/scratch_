import { useReducer } from 'react';
import type { ConnectionState, ConnectionAction } from '../types/connection';

export function connectionReducer(state: ConnectionState, action: ConnectionAction): ConnectionState {
  if (action.type === 'FORCE') return action.state;
  if (action.type === 'CONNECT') return 'connecting';

  switch (state) {
    case 'connecting':
      if (action.type === 'CONNECTED') return 'live';
      if (action.type === 'ERROR') return 'error';
      return state;
    case 'live':
      if (action.type === 'ERROR' || action.type === 'DISCONNECT') return 'reconnecting';
      return state;
    case 'reconnecting':
      if (action.type === 'CONNECTED') return 'live';
      if (action.type === 'ERROR') return 'error';
      return state;
    case 'error':
      if (action.type === 'RETRY') return 'connecting';
      return state;
    default:
      return state;
  }
}

export function useConnectionMachine() {
  return useReducer(connectionReducer, 'connecting' as ConnectionState);
}
