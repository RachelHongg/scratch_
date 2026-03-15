import { useCallback, useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  fps: number;
  renderCount: number;
  lastRenderTime: number;
  filterSortTime: number;
  workerComputeTime: number;
  dataFreshness: number;
  fetchLatency: number;
  fetchSuccessRate: number;
  totalItems: number;
  visibleItems: number;
}

const initialMetrics: PerformanceMetrics = {
  fps: 0,
  renderCount: 0,
  lastRenderTime: 0,
  filterSortTime: 0,
  workerComputeTime: 0,
  dataFreshness: 0,
  fetchLatency: 0,
  fetchSuccessRate: 100,
  totalItems: 0,
  visibleItems: 0,
};

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics);
  const metricsRef = useRef<PerformanceMetrics>(initialMetrics);
  const renderCountRef = useRef(0);
  const fpsFramesRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());
  const fetchStatsRef = useRef({ success: 0, total: 0 });
  const lastFetchTimeRef = useRef<number>(Date.now());

  // FPS tracking via requestAnimationFrame
  useEffect(() => {
    let animId: number;
    const tick = () => {
      fpsFramesRef.current++;
      const now = performance.now();
      const delta = now - fpsLastTimeRef.current;
      if (delta >= 1000) {
        const fps = Math.round((fpsFramesRef.current / delta) * 1000);
        fpsFramesRef.current = 0;
        fpsLastTimeRef.current = now;
        metricsRef.current = { ...metricsRef.current, fps };
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update data freshness every second
  useEffect(() => {
    const interval = setInterval(() => {
      const freshness = (Date.now() - lastFetchTimeRef.current) / 1000;
      setMetrics({ ...metricsRef.current, dataFreshness: Math.round(freshness * 10) / 10 });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const trackRender = useCallback(() => {
    renderCountRef.current++;
    metricsRef.current = { ...metricsRef.current, renderCount: renderCountRef.current };
  }, []);

  const trackRenderTime = useCallback((ms: number) => {
    metricsRef.current = { ...metricsRef.current, lastRenderTime: Math.round(ms * 100) / 100 };
  }, []);

  const trackFilterSort = useCallback((ms: number) => {
    metricsRef.current = { ...metricsRef.current, filterSortTime: Math.round(ms * 100) / 100 };
  }, []);

  const trackWorkerCompute = useCallback((ms: number) => {
    metricsRef.current = { ...metricsRef.current, workerComputeTime: Math.round(ms * 100) / 100 };
  }, []);

  const trackFetch = useCallback((success: boolean, latencyMs: number) => {
    fetchStatsRef.current.total++;
    if (success) fetchStatsRef.current.success++;
    const rate = Math.round((fetchStatsRef.current.success / fetchStatsRef.current.total) * 100);
    lastFetchTimeRef.current = Date.now();
    metricsRef.current = {
      ...metricsRef.current,
      fetchLatency: Math.round(latencyMs),
      fetchSuccessRate: rate,
      dataFreshness: 0,
    };
  }, []);

  const trackItemCounts = useCallback((total: number, visible: number) => {
    metricsRef.current = { ...metricsRef.current, totalItems: total, visibleItems: visible };
  }, []);

  return {
    metrics,
    trackRender,
    trackRenderTime,
    trackFilterSort,
    trackWorkerCompute,
    trackFetch,
    trackItemCounts,
  };
}
