export function PriceText({ value, type }: { value: number | null; type: 'price' | 'change' }) {
  if (value == null) return <span className="font-mono text-gray-400">N/A</span>;

  if (type === 'price') {
    return <span className="font-mono">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
  }

  const isPositive = value >= 0;
  return (
    <span className={`font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
