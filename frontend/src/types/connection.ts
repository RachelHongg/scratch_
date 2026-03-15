export type ConnectionState = 'connecting' | 'live' | 'confirmed' | 'error';
export type ConnectionAction =
  | { type: 'CONNECTED'; connectionStatus: 'live' | 'confirmed' }
  | { type: 'ERROR' }
  | { type: 'FETCHING' };
