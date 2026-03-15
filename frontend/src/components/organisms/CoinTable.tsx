import { useContext, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Coin } from '../../types/coin';
import { CoinRow } from './CoinRow';
import { Spinner } from '../atoms/Spinner';
import { PerformanceContext } from '../../contexts/PerformanceContext';

interface CoinTableProps {
  coins: Coin[];
  query: string;
  sort: 'asc' | 'desc' | null;
  isLoading: boolean;
}

export function CoinTable({ coins, query, sort, isLoading }: CoinTableProps) {
  const { trackFilterSort, trackRender, trackRenderTime, trackItemCounts } = useContext(PerformanceContext);
  const renderStart = performance.now();

  const filtered = useMemo(() => {
    const start = performance.now();
    const q = query.toLowerCase();
    const result = coins.filter(c =>
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
    trackFilterSort(performance.now() - start);
    return result;
  }, [coins, query, trackFilterSort]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const start = performance.now();
    const result = [...filtered].sort((a, b) =>
      sort === 'asc' ? a.current_price - b.current_price : b.current_price - a.current_price
    );
    const elapsed = performance.now() - start;
    trackFilterSort(elapsed);
    return result;
  }, [filtered, sort, trackFilterSort]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  useEffect(() => {
    trackItemCounts(coins.length, sorted.length);
  }, [coins.length, sorted.length, trackItemCounts]);

  useEffect(() => {
    trackRender();
    trackRenderTime(performance.now() - renderStart);
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  if (sorted.length === 0) {
    return <p className="text-center text-gray-500 py-12">No results found.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Coin</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">24h Change</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Market Cap</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
      </table>
      <div ref={parentRef} className="overflow-auto max-h-[600px]">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const coin = sorted[virtualRow.index];
            return (
              <div
                key={coin.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <table className="w-full">
                  <tbody>
                    <CoinRow coin={coin} rank={virtualRow.index + 1} />
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
