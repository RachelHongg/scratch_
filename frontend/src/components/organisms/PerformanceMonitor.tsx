import { useContext, useState } from 'react';
import { PerformanceContext } from '../../contexts/PerformanceContext';
import { Badge } from '../atoms/Badge';

function MetricRow({ label, value, unit, warn, critical, invertColor }: {
  label: string;
  value: number;
  unit: string;
  warn?: number;
  critical?: number;
  invertColor?: boolean;
}) {
  let variant: 'success' | 'warning' | 'error' = 'success';

  if (invertColor) {
    // Low is bad (FPS, Success Rate)
    if (critical !== undefined && value < critical) variant = 'error';
    else if (warn !== undefined && value < warn) variant = 'warning';
    else variant = 'success';
  } else {
    if (critical !== undefined && value >= critical) variant = 'error';
    else if (warn !== undefined && value >= warn) variant = 'warning';
  }

  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <Badge variant={variant}>
        {value}{unit}
      </Badge>
    </div>
  );
}

export function PerformanceMonitor() {
  const { metrics } = useContext(PerformanceContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-72">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-2 text-left text-sm font-semibold text-gray-700 flex items-center justify-between border-b border-gray-100"
      >
        Performance Monitor
        <span className="text-xs text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>
      {!collapsed && (
        <div className="px-4 py-2 space-y-0.5">
          <div className="text-xs font-semibold text-gray-600 mt-1 mb-1 border-b border-gray-100 pb-1">Real-time Processing</div>
          <MetricRow label="FPS" value={metrics.fps} unit="" invertColor warn={50} critical={30} />
          <MetricRow label="Data Freshness" value={metrics.dataFreshness} unit="s" warn={30} critical={60} />
          <MetricRow label="Fetch Latency" value={metrics.fetchLatency} unit="ms" warn={1000} critical={3000} />
          <MetricRow label="E2E Latency" value={metrics.e2eLatency} unit="ms" warn={50} critical={200} />
          <MetricRow label="Success Rate" value={metrics.fetchSuccessRate} unit="%" invertColor warn={95} critical={80} />

          <div className="text-xs font-semibold text-gray-600 mt-2 mb-1 border-b border-gray-100 pb-1">Data Processing</div>
          <MetricRow label="Render Time" value={metrics.lastRenderTime} unit="ms" warn={16} critical={50} />
          <MetricRow label="Filter/Sort (Worker)" value={metrics.filterSortTime} unit="ms" warn={10} critical={50} />
          <MetricRow label="Metrics (Worker)" value={metrics.workerComputeTime} unit="ms" warn={50} critical={200} />
          <MetricRow label="Re-renders" value={metrics.renderCount} unit="" />
          <MetricRow label="Skipped (memo)" value={metrics.skippedRenders} unit="" />
          <MetricRow label="Items" value={metrics.visibleItems} unit={`/${metrics.totalItems}`} />

          <div className="text-xs font-semibold text-gray-600 mt-2 mb-1 border-b border-gray-100 pb-1">Resources</div>
          <MetricRow label="JS Heap" value={metrics.memoryUsage} unit="MB" warn={50} critical={100} />
        </div>
      )}
    </div>
  );
}
