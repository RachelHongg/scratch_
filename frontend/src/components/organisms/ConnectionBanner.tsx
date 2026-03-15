import { useContext, useEffect, useState } from 'react';
import { ConnectionContext } from '../../contexts/ConnectionContext';
import { Button } from '../atoms/Button';

const bannerStyles = {
  connecting: 'bg-yellow-100 text-yellow-800',
  live: 'bg-green-100 text-green-800',
  reconnecting: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
};

const bannerText = {
  connecting: 'Connecting...',
  live: 'Live',
  reconnecting: 'Reconnecting...',
  error: 'Connection Error',
};

export function ConnectionBanner() {
  const { state, dispatch } = useContext(ConnectionContext);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (state === 'live') {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(true);
  }, [state]);

  if (!visible) return null;

  return (
    <div className={`px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${bannerStyles[state]}`}>
      {bannerText[state]}
      {state === 'error' && (
        <Button variant="danger" size="sm" onClick={() => dispatch({ type: 'RETRY' })}>
          Retry
        </Button>
      )}
    </div>
  );
}
