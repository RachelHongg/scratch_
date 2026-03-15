import { describe, it, expect } from 'vitest';
import { connectionReducer } from '../hooks/useConnectionMachine';
import type { ConnectionState } from '../types/connection';

describe('connectionReducer', () => {
  it('transitions from connecting to live on CONNECTED', () => {
    expect(connectionReducer('connecting', { type: 'CONNECTED' })).toBe('live');
  });

  it('transitions from connecting to error on ERROR', () => {
    expect(connectionReducer('connecting', { type: 'ERROR' })).toBe('error');
  });

  it('transitions from live to reconnecting on ERROR', () => {
    expect(connectionReducer('live', { type: 'ERROR' })).toBe('reconnecting');
  });

  it('transitions from live to reconnecting on DISCONNECT', () => {
    expect(connectionReducer('live', { type: 'DISCONNECT' })).toBe('reconnecting');
  });

  it('transitions from reconnecting to live on CONNECTED', () => {
    expect(connectionReducer('reconnecting', { type: 'CONNECTED' })).toBe('live');
  });

  it('transitions from reconnecting to error on ERROR', () => {
    expect(connectionReducer('reconnecting', { type: 'ERROR' })).toBe('error');
  });

  it('transitions from error to connecting on RETRY', () => {
    expect(connectionReducer('error', { type: 'RETRY' })).toBe('connecting');
  });

  it('ignores invalid transition: live + RETRY stays live', () => {
    expect(connectionReducer('live', { type: 'RETRY' })).toBe('live');
  });

  it('CONNECT always transitions to connecting', () => {
    const states: ConnectionState[] = ['connecting', 'live', 'reconnecting', 'error'];
    states.forEach(s => {
      expect(connectionReducer(s, { type: 'CONNECT' })).toBe('connecting');
    });
  });

  it('FORCE sets state directly', () => {
    expect(connectionReducer('live', { type: 'FORCE', state: 'error' })).toBe('error');
    expect(connectionReducer('connecting', { type: 'FORCE', state: 'live' })).toBe('live');
  });

  it('handles full cycle: connecting -> live -> reconnecting -> error -> connecting -> live', () => {
    let state: ConnectionState = 'connecting';
    state = connectionReducer(state, { type: 'CONNECTED' });
    expect(state).toBe('live');
    state = connectionReducer(state, { type: 'ERROR' });
    expect(state).toBe('reconnecting');
    state = connectionReducer(state, { type: 'ERROR' });
    expect(state).toBe('error');
    state = connectionReducer(state, { type: 'RETRY' });
    expect(state).toBe('connecting');
    state = connectionReducer(state, { type: 'CONNECTED' });
    expect(state).toBe('live');
  });
});
