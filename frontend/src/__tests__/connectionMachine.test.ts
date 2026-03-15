import { describe, it, expect } from 'vitest';
import { connectionReducer } from '../hooks/useConnectionMachine';
import type { ConnectionState } from '../types/connection';

describe('connectionReducer', () => {
  it('FETCHING → connecting', () => {
    expect(connectionReducer('live', { type: 'FETCHING' })).toBe('connecting');
  });

  it('CONNECTED (live) → live', () => {
    expect(connectionReducer('connecting', { type: 'CONNECTED', connectionStatus: 'live' })).toBe('live');
  });

  it('CONNECTED (confirmed) → confirmed', () => {
    expect(connectionReducer('connecting', { type: 'CONNECTED', connectionStatus: 'confirmed' })).toBe('confirmed');
  });

  it('ERROR → error', () => {
    expect(connectionReducer('connecting', { type: 'ERROR' })).toBe('error');
    expect(connectionReducer('live', { type: 'ERROR' })).toBe('error');
  });

  it('서버 상태 변경 사이클: connecting → live → confirmed → error → live', () => {
    let state: ConnectionState = 'connecting';
    state = connectionReducer(state, { type: 'CONNECTED', connectionStatus: 'live' });
    expect(state).toBe('live');
    state = connectionReducer(state, { type: 'FETCHING' });
    expect(state).toBe('connecting');
    state = connectionReducer(state, { type: 'CONNECTED', connectionStatus: 'confirmed' });
    expect(state).toBe('confirmed');
    state = connectionReducer(state, { type: 'FETCHING' });
    state = connectionReducer(state, { type: 'ERROR' });
    expect(state).toBe('error');
    state = connectionReducer(state, { type: 'FETCHING' });
    state = connectionReducer(state, { type: 'CONNECTED', connectionStatus: 'live' });
    expect(state).toBe('live');
  });
});
