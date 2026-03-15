import type { ConfirmStatus } from '../../types/confirm';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Spinner } from '../atoms/Spinner';

interface ConfirmButtonProps {
  status: ConfirmStatus;
  onConfirm: () => void;
  onRetry: () => void;
}

export function ConfirmButton({ status, onConfirm, onRetry }: ConfirmButtonProps) {
  switch (status) {
    case 'idle':
      return <Button variant="primary" size="sm" onClick={onConfirm}>Confirm</Button>;
    case 'pending':
      return <Button variant="primary" size="sm" disabled><Spinner size="sm" /> <span className="ml-1">Pending</span></Button>;
    case 'confirmed':
      return <Badge variant="success">Confirmed</Badge>;
    case 'failed':
      return (
        <div className="flex items-center gap-2">
          <Badge variant="error">Failed</Badge>
          <Button variant="danger" size="sm" onClick={onRetry}>Retry</Button>
        </div>
      );
    default:
      return <Button variant="primary" size="sm" onClick={onConfirm}>Confirm</Button>;
  }
}
