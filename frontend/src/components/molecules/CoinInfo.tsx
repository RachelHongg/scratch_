export function CoinInfo({ image, name, symbol }: { image: string; name: string; symbol: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src={image} alt={name} width={24} height={24} className="rounded-full" />
      <span className="font-medium text-gray-900">{name}</span>
      <span className="text-gray-400 text-xs uppercase">{symbol}</span>
    </div>
  );
}
