self.onmessage = (event: MessageEvent) => {
  const { type, coins } = event.data;
  if (type !== 'COMPUTE_METRICS') return;

  const volatility = coins
    .filter((c: any) => c.current_price > 0)
    .map((c: any) => ({
      id: c.id, name: c.name, symbol: c.symbol,
      value: ((c.high_24h - c.low_24h) / c.current_price) * 100
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  const topMovers = coins
    .map((c: any) => ({
      id: c.id, name: c.name, symbol: c.symbol,
      change: c.price_change_percentage_24h
    }))
    .sort((a: any, b: any) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  self.postMessage({ type: 'METRICS_RESULT', volatility, topMovers });
};
