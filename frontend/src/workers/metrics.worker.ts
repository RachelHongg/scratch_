self.onmessage = (event: MessageEvent) => {
  const { type, coins, query, sort } = event.data;

  if (type === 'COMPUTE_METRICS') {
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
  }

  if (type === 'FILTER_SORT') {
    const q = (query || '').toLowerCase();
    let filtered = coins;
    if (q) {
      filtered = coins.filter((c: any) =>
        c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      );
    }

    let sorted = filtered;
    if (sort === 'asc') {
      sorted = [...filtered].sort((a: any, b: any) => a.current_price - b.current_price);
    } else if (sort === 'desc') {
      sorted = [...filtered].sort((a: any, b: any) => b.current_price - a.current_price);
    }

    self.postMessage({ type: 'FILTER_SORT_RESULT', coins: sorted, totalCount: coins.length, visibleCount: sorted.length });
  }
};
