import { useContext, useState } from 'react';
import { PerformanceContext } from '../../contexts/PerformanceContext';
import { Badge } from '../atoms/Badge';

function MetricRow({ label, value, unit, warn, critical }: {
  label: string;
  value: number;
  unit: string;
  warn?: number;
  critical?: number;
}) {
  let variant: 'success' | 'warning' | 'error' = 'success';
  if (critical !== undefined && value >= critical) variant = 'error';
  else if (warn !== undefined && value >= warn) variant = 'warning';

  // For FPS, logic is inverted (low is bad)
  if (label === 'FPS') {
    if (value < 30) variant = 'error';
    else if (value < 50) variant = 'warning';
    else variant = 'success';
  }

  if (label === 'Success Rate') {
    if (value < 80) variant = 'error';
    else if (value < 95) variant = 'warning';
    else variant = 'success';
  }

  return (
    <div className="flex items-center justify-between py-1">
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
          <MetricRow label="FPS" value={metrics.fps} unit="" />
          <MetricRow label="Data Freshness" value={metrics.dataFreshness} unit="s" warn={30} critical={60} />
          <MetricRow label="Fetch Latency" value={metrics.fetchLatency} unit="ms" warn={1000} critical={3000} />
          <MetricRow label="Success Rate" value={metrics.fetchSuccessRate} unit="%" />

          <div className="text-xs font-semibold text-gray-600 mt-2 mb-1 border-b border-gray-100 pb-1">Data Processing</div>
          <MetricRow label="Render Time" value={metrics.lastRenderTime} unit="ms" warn={16} critical={50} />
          <MetricRow label="Filter/Sort" value={metrics.filterSortTime} unit="ms" warn={10} critical={50} />
          <MetricRow label="Worker Compute" value={metrics.workerComputeTime} unit="ms" warn={50} critical={200} />
          <MetricRow label="Re-renders" value={metrics.renderCount} unit="" />
          <MetricRow label="Items" value={metrics.visibleItems} unit={`/${metrics.totalItems}`} />
        </div>
      )}
    </div>
  );
}
