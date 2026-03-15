import { API_BASE } from '../constants';
import type { Coin } from '../types/coin';

export interface CoinsResponse {
  connection_status: 'live' | 'confirmed';
  data: Coin[];
}

export async function fetchCoins(multiply = 1): Promise<CoinsResponse> {
  const params = multiply > 1 ? `?multiply=${multiply}` : '';
  const res = await fetch(`${API_BASE}/api/coins${params}`);
  if (!res.ok) throw new Error('Failed to fetch coins');
  return res.json();
}

export async function confirmCoin(coinId: string): Promise<{ coin_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/confirm/${coinId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to confirm');
  return res.json();
}

export async function simulateConnection(state: 'live' | 'error' | 'confirmed'): Promise<void> {
  await fetch(`${API_BASE}/api/connection/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
}

export async function resetConnection(): Promise<void> {
  await fetch(`${API_BASE}/api/connection/reset`, { method: 'POST' });
}
