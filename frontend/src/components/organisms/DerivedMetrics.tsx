import { useDerivedMetrics } from '../../hooks/useDerivedMetrics';
import type { Coin } from '../../types/coin';
import { Spinner } from '../atoms/Spinner';

export function DerivedMetrics({ coins }: { coins: Coin[] }) {
  const { volatility, topMovers } = useDerivedMetrics(coins);

  if (coins.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Volatility Top 5</h3>
        {volatility.length === 0 ? <Spinner size="sm" /> : (
          <table className="w-full text-sm">
            <tbody>
              {volatility.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 font-medium">{item.name} <span className="text-gray-400 text-xs">{item.symbol.toUpperCase()}</span></td>
                  <td className="py-1.5 text-right font-mono">{item.value.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Movers</h3>
        {topMovers.length === 0 ? <Spinner size="sm" /> : (
          <table className="w-full text-sm">
            <tbody>
              {topMovers.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-400">{i + 1}</td>
                  <td className="py-1.5 font-medium">{item.name} <span className="text-gray-400 text-xs">{item.symbol.toUpperCase()}</span></td>
                  <td className={`py-1.5 text-right font-mono ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
