import { API_BASE } from '../constants';
import type { Coin } from '../types/coin';

export async function fetchCoins(multiply = 1): Promise<Coin[]> {
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
