import { useContext, useEffect, useRef, useState } from 'react';
import type { Coin } from '../types/coin';
import { PerformanceContext } from '../contexts/PerformanceContext';

interface VolatilityItem { id: string; name: string; symbol: string; value: number }
interface MoverItem { id: string; name: string; symbol: string; change: number }

export function useDerivedMetrics(coins: Coin[]) {
  const workerRef = useRef<Worker>(undefined);
  const postTimeRef = useRef<number>(0);
  const [volatility, setVolatility] = useState<VolatilityItem[]>([]);
  const [topMovers, setTopMovers] = useState<MoverItem[]>([]);
  const { trackWorkerCompute } = useContext(PerformanceContext);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/metrics.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'METRICS_RESULT') {
        const computeTime = performance.now() - postTimeRef.current;
        trackWorkerCompute(computeTime);
        setVolatility(event.data.volatility);
        setTopMovers(event.data.topMovers);
      }
    };
    return () => workerRef.current?.terminate();
  }, [trackWorkerCompute]);

  useEffect(() => {
    if (coins.length > 0 && workerRef.current) {
      postTimeRef.current = performance.now();
      workerRef.current.postMessage({ type: 'COMPUTE_METRICS', coins });
    }
  }, [coins]);

  return { volatility, topMovers };
}
