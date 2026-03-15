import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';
import { fetchCoins } from '../lib/api';
import { POLL_INTERVAL } from '../constants';
import { ConnectionContext } from '../contexts/ConnectionContext';
import { PerformanceContext } from '../contexts/PerformanceContext';

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
