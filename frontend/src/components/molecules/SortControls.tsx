import { Button } from '../atoms/Button';
import { SortIcon } from '../atoms/SortIcon';

export function SortControls({ sort, onSortChange }: { sort: 'asc' | 'desc' | null; onSortChange: (sort: 'asc' | 'desc' | null) => void }) {
  const handleClick = () => {
    if (sort === null) onSortChange('asc');
    else if (sort === 'asc') onSortChange('desc');
    else onSortChange(null);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Price <SortIcon direction={sort} />
    </Button>
  );
}
