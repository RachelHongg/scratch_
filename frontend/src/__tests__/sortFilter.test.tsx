import { describe, it, expect } from 'vitest';
import type { Coin } from '../types/coin';

const mockCoins: Coin[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: '', current_price: 50000, price_change_percentage_24h: 2.5, market_cap: 1000000, total_volume: 500000, high_24h: 51000, low_24h: 49000 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: '', current_price: 3000, price_change_percentage_24h: -1.2, market_cap: 400000, total_volume: 200000, high_24h: 3100, low_24h: 2900 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: '', current_price: 1.5, price_change_percentage_24h: 5.1, market_cap: 50000, total_volume: 10000, high_24h: 1.6, low_24h: 1.4 },
];

function filterCoins(coins: Coin[], query: string): Coin[] {
  const q = query.toLowerCase();
  return coins.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
}

function sortCoins(coins: Coin[], sort: 'asc' | 'desc' | null): Coin[] {
  if (!sort) return coins;
  return [...coins].sort((a, b) =>
    sort === 'asc' ? a.current_price - b.current_price : b.current_price - a.current_price
  );
}

describe('filterCoins', () => {
  it('filters by symbol "btc"', () => {
    const result = filterCoins(mockCoins, 'btc');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bitcoin');
  });

  it('filters by name case-insensitive', () => {
    const result = filterCoins(mockCoins, 'Bitcoin');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('bitcoin');
  });

  it('returns all for empty query', () => {
    expect(filterCoins(mockCoins, '')).toHaveLength(3);
  });

  it('returns empty for no match', () => {
    expect(filterCoins(mockCoins, 'xyz')).toHaveLength(0);
  });
});

describe('sortCoins', () => {
  it('sorts ascending by price', () => {
    const result = sortCoins(mockCoins, 'asc');
    expect(result[0].id).toBe('cardano');
    expect(result[2].id).toBe('bitcoin');
  });

  it('sorts descending by price', () => {
    const result = sortCoins(mockCoins, 'desc');
    expect(result[0].id).toBe('bitcoin');
    expect(result[2].id).toBe('cardano');
  });

  it('returns original order for null sort', () => {
    const result = sortCoins(mockCoins, null);
    expect(result).toEqual(mockCoins);
  });
});
