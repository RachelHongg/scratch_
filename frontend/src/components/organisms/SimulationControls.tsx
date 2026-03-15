import { useContext, useState } from 'react';
import { ConnectionContext } from '../../contexts/ConnectionContext';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';
import { simulateConnection, resetConnection } from '../../lib/api';
import type { ConnectionState } from '../../types/connection';

const badgeVariant: Record<ConnectionState, 'info' | 'success' | 'warning' | 'error'> = {
  connecting: 'info',
  live: 'success',
  confirmed: 'success',
  error: 'error',
};

type SimTarget = 'live' | 'error' | 'confirmed';

export function SimulationControls({ onRefetch, onRefresh }: { onRefetch: () => void; onRefresh: () => void }) {
  const { state } = useContext(ConnectionContext);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSimulate = async (target: SimTarget) => {
    setLoading(target);
    await simulateConnection(target);
    onRefetch();
    setLoading(null);
  };

  const handleReset = async () => {
    setLoading('reset');
    await resetConnection();
    onRefresh();
    setLoading(null);
  };

  const buttons: { label: string; target: SimTarget }[] = [
    { label: 'Live', target: 'live' },
    { label: 'Error', target: 'error' },
    { label: 'Confirmed', target: 'confirmed' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Connection Simulation</h3>
        <Badge variant={badgeVariant[state]}>{state}</Badge>
      </div>
      <div className="flex gap-2 flex-wrap">
        {buttons.map(({ label, target }) => (
          <Button
            key={target}
            variant={state === target ? 'primary' : 'outline'}
            size="sm"
            disabled={loading !== null}
            onClick={() => handleSimulate(target)}
          >
            {loading === target ? <Spinner size="sm" /> : label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          disabled={loading !== null}
          onClick={handleReset}
        >
          {loading === 'reset' ? <Spinner size="sm" /> : 'Refresh'}
        </Button>
      </div>
    </div>
  );
}
