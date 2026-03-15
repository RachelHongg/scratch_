const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
};

export function Spinner({ size = 'md' }: { size?: keyof typeof sizes }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`} />
  );
}
