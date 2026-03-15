export type ConnectionState = 'connecting' | 'live' | 'reconnecting' | 'error';
export type ConnectionAction =
  | { type: 'CONNECT' }
  | { type: 'CONNECTED' }
  | { type: 'DISCONNECT' }
  | { type: 'ERROR' }
  | { type: 'RETRY' }
  | { type: 'FORCE'; state: ConnectionState };
