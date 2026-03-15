import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';
import { fetchCoins } from '../lib/api';
import { POLL_INTERVAL } from '../constants';
import { ConnectionContext } from '../contexts/ConnectionContext';
import { PerformanceContext } from '../contexts/PerformanceContext';
import type { Coin } from '../types/coin';

function coinEqual(a: Coin, b: Coin): boolean {
  return (
    a.id === b.id &&
    a.current_price === b.current_price &&
    a.price_change_percentage_24h === b.price_change_percentage_24h &&
    a.market_cap === b.market_cap &&
    a.high_24h === b.high_24h &&
    a.low_24h === b.low_24h &&
    a.total_volume === b.total_volume
  );
}

function structuralShareCoins(oldData: Coin[] | undefined, newData: Coin[]): Coin[] {
  if (!oldData) return newData;
  if (oldData.length !== newData.length) return newData;

  let changed = false;
  const result = newData.map((newCoin, i) => {
    if (coinEqual(oldData[i], newCoin)) {
      return oldData[i]; // reuse old reference
    }
    changed = true;
    return newCoin;
  });

  return changed ? result : oldData; // reuse entire array if nothing changed
}

export function useCoins(multiply = 1) {
  const { dispatch } = useContext(ConnectionContext);
  const { trackFetch } = useContext(PerformanceContext);
  const fetchStartRef = useRef<number>(0);

  const query = useQuery({
    queryKey: ['coins', multiply],
    queryFn: async () => {
      fetchStartRef.current = performance.now();
      const data = await fetchCoins(multiply);
      const latency = performance.now() - fetchStartRef.current;
      trackFetch(true, latency);
      return data;
    },
    refetchInterval: POLL_INTERVAL,
    structuralSharing: (oldData, newData) => structuralShareCoins(oldData as Coin[] | undefined, newData as Coin[]),
  });

  useEffect(() => {
    if (query.isSuccess) {
      dispatch({ type: 'CONNECTED' });
    }
  }, [query.isSuccess, query.dataUpdatedAt, dispatch]);

  useEffect(() => {
    if (query.isError) {
      dispatch({ type: 'ERROR' });
      const latency = performance.now() - fetchStartRef.current;
      trackFetch(false, latency);
    }
  }, [query.isError, dispatch, trackFetch]);

  return { coins: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}
