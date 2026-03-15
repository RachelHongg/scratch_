import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';
import { fetchCoins, type CoinsResponse } from '../lib/api';
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

function structuralShareResponse(oldData: CoinsResponse | undefined, newData: CoinsResponse): CoinsResponse {
  if (!oldData) return newData;
  if (oldData.connection_status !== newData.connection_status) return newData;
  if (oldData.data.length !== newData.data.length) return newData;

  let changed = false;
  const result = newData.data.map((newCoin, i) => {
    if (coinEqual(oldData.data[i], newCoin)) {
      return oldData.data[i];
    }
    changed = true;
    return newCoin;
  });

  if (!changed) return oldData;
  return { ...newData, data: result };
}

export function useCoins(multiply = 1) {
  const { dispatch } = useContext(ConnectionContext);
  const { trackFetch } = useContext(PerformanceContext);
  const fetchStartRef = useRef<number>(0);

  const query = useQuery({
    queryKey: ['coins', multiply],
    queryFn: async () => {
      fetchStartRef.current = performance.now();
      dispatch({ type: 'FETCHING' });
      const response = await fetchCoins(multiply);
      const latency = performance.now() - fetchStartRef.current;
      trackFetch(true, latency);
      return response;
    },
    refetchInterval: POLL_INTERVAL,
    structuralSharing: (oldData, newData) =>
      structuralShareResponse(oldData as CoinsResponse | undefined, newData as CoinsResponse),
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      dispatch({ type: 'CONNECTED', connectionStatus: query.data.connection_status });
    }
  }, [query.isSuccess, query.dataUpdatedAt, query.data, dispatch]);

  useEffect(() => {
    if (query.isError) {
      dispatch({ type: 'ERROR' });
      const latency = performance.now() - fetchStartRef.current;
      trackFetch(false, latency);
    }
  }, [query.isError, dispatch, trackFetch]);

  return {
    coins: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
