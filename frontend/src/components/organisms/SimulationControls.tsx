import { useContext } from 'react';
import { ConnectionContext } from '../../contexts/ConnectionContext';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import type { ConnectionState } from '../../types/connection';

const badgeVariant: Record<ConnectionState, 'info' | 'success' | 'warning' | 'error'> = {
  connecting: 'info',
  live: 'success',
  reconnecting: 'warning',
  error: 'error',
};

export function SimulationControls() {
  const { state, dispatch } = useContext(ConnectionContext);

  const buttons: { label: string; target: ConnectionState }[] = [
    { label: 'Connecting', target: 'connecting' },
    { label: 'Live', target: 'live' },
    { label: 'Reconnecting', target: 'reconnecting' },
    { label: 'Error', target: 'error' },
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
            onClick={() => dispatch({ type: 'FORCE', state: target })}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
