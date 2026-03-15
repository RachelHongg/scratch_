export function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="inline-block ml-1">
      <path d="M6 0L10 5H2L6 0Z" fill={direction === 'asc' ? 'currentColor' : '#d1d5db'} />
      <path d="M6 12L2 7H10L6 12Z" fill={direction === 'desc' ? 'currentColor' : '#d1d5db'} />
    </svg>
  );
}
