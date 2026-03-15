import { useReducer } from 'react';
import type { ConnectionState, ConnectionAction } from '../types/connection';

export function connectionReducer(state: ConnectionState, action: ConnectionAction): ConnectionState {
  switch (action.type) {
    case 'FETCHING':
      return 'connecting';
    case 'CONNECTED':
      return action.connectionStatus; // 'live' | 'confirmed'
    case 'ERROR':
      return 'error';
    default:
      return state;
  }
}

export function useConnectionMachine() {
  return useReducer(connectionReducer, 'connecting' as ConnectionState);
}
