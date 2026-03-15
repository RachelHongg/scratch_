import { useContext, useEffect, useRef, useState } from 'react';
import type { Coin } from '../types/coin';
import { PerformanceContext } from '../contexts/PerformanceContext';

export function useFilterSortWorker(coins: Coin[], query: string, sort: 'asc' | 'desc' | null) {
  const workerRef = useRef<Worker>(undefined);
  const postTimeRef = useRef<number>(0);
  const [result, setResult] = useState<{ coins: Coin[]; totalCount: number; visibleCount: number }>({
    coins: [],
    totalCount: 0,
    visibleCount: 0,
  });
  const { trackFilterSort, trackItemCounts } = useContext(PerformanceContext);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/metrics.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'FILTER_SORT_RESULT') {
        const elapsed = performance.now() - postTimeRef.current;
        trackFilterSort(elapsed);
        trackItemCounts(event.data.totalCount, event.data.visibleCount);
        setResult({
          coins: event.data.coins,
          totalCount: event.data.totalCount,
          visibleCount: event.data.visibleCount,
        });
      }
    };
    return () => workerRef.current?.terminate();
  }, [trackFilterSort, trackItemCounts]);

  useEffect(() => {
    if (workerRef.current && coins.length > 0) {
      postTimeRef.current = performance.now();
      workerRef.current.postMessage({ type: 'FILTER_SORT', coins, query, sort });
    } else if (coins.length === 0) {
      setResult({ coins: [], totalCount: 0, visibleCount: 0 });
    }
  }, [coins, query, sort]);

  return result;
}
