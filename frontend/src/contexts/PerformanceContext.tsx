import { createContext, type ReactNode } from 'react';
import { usePerformanceMetrics, type PerformanceMetrics } from '../hooks/usePerformanceMetrics';

interface PerformanceContextValue {
  metrics: PerformanceMetrics;
  trackRender: () => void;
  trackRenderTime: (ms: number) => void;
  trackFilterSort: (ms: number) => void;
  trackWorkerCompute: (ms: number) => void;
  trackFetch: (success: boolean, latencyMs: number) => void;
  trackItemCounts: (total: number, visible: number) => void;
  trackSkippedRender: () => void;
  trackE2ELatency: (ms: number) => void;
}

export const PerformanceContext = createContext<PerformanceContextValue>({
  metrics: {
    fps: 0, renderCount: 0, lastRenderTime: 0, filterSortTime: 0,
    workerComputeTime: 0, dataFreshness: 0, fetchLatency: 0,
    fetchSuccessRate: 100, totalItems: 0, visibleItems: 0,
    memoryUsage: 0, skippedRenders: 0, e2eLatency: 0,
  },
  trackRender: () => {},
  trackRenderTime: () => {},
  trackFilterSort: () => {},
  trackWorkerCompute: () => {},
  trackFetch: () => {},
  trackItemCounts: () => {},
  trackSkippedRender: () => {},
  trackE2ELatency: () => {},
});

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const perf = usePerformanceMetrics();
  return (
    <PerformanceContext.Provider value={perf}>
      {children}
    </PerformanceContext.Provider>
  );
}
