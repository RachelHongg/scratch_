import { useState } from 'react';
import { useCoins } from '../../hooks/useCoins';
import { useURLSync } from '../../hooks/useURLSync';
import { ConnectionBanner } from '../organisms/ConnectionBanner';
import { SimulationControls } from '../organisms/SimulationControls';
import { SearchBar } from '../molecules/SearchBar';
import { SortControls } from '../molecules/SortControls';
import { DerivedMetrics } from '../organisms/DerivedMetrics';
import { CoinTable } from '../organisms/CoinTable';
import { Button } from '../atoms/Button';

const SCALE_OPTIONS = [1, 10, 20, 50, 100];

export function Dashboard() {
  const [multiply, setMultiply] = useState(1);
  const { coins, isLoading } = useCoins(multiply);
  const { query, sort, setQuery, setSort } = useURLSync();

  return (
    <div className="space-y-6">
      <ConnectionBanner />
      <SimulationControls />
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Data Scale (Stress Test)</h3>
          <span className="text-xs text-gray-400">{coins.length} coins loaded</span>
        </div>
        <div className="flex gap-2 mt-2">
          {SCALE_OPTIONS.map((n) => (
            <Button
              key={n}
              variant={multiply === n ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setMultiply(n)}
            >
              {n === 1 ? '1x (50)' : `${n}x (${n * 50})`}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <SortControls sort={sort} onSortChange={setSort} />
      </div>
      <DerivedMetrics coins={coins} />
      <CoinTable coins={coins} query={query} sort={sort} isLoading={isLoading} />
    </div>
  );
}
