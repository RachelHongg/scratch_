import { memo, useContext } from 'react';
import type { Coin } from '../../types/coin';
import { ConfirmContext } from '../../contexts/ConfirmContext';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { CoinInfo } from '../molecules/CoinInfo';
import { ConfirmButton } from '../molecules/ConfirmButton';
import { PriceText } from '../atoms/PriceText';

function CoinRowInner({ coin, rank }: { coin: Coin; rank: number }) {
  const { confirmStates, dispatch } = useContext(ConfirmContext);
  const { confirm } = useConfirmAction();
  const status = confirmStates[coin.id] || 'idle';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 text-sm text-gray-500">{rank}</td>
      <td className="py-3 px-4">
        <CoinInfo image={coin.image} name={coin.name} symbol={coin.symbol} />
      </td>
      <td className="py-3 px-4 text-right">
        <PriceText value={coin.current_price} type="price" />
      </td>
      <td className="py-3 px-4 text-right">
        <PriceText value={coin.price_change_percentage_24h} type="change" />
      </td>
      <td className="py-3 px-4 text-right text-sm text-gray-600">
        ${(coin.market_cap ?? 0).toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right">
        <ConfirmButton
          status={status}
          onConfirm={() => confirm(coin.id)}
          onRetry={() => {
            dispatch({ type: 'RESET', coinId: coin.id });
            confirm(coin.id);
          }}
        />
      </td>
    </tr>
  );
}

export const CoinRow = memo(CoinRowInner, (prev, next) => {
  return (
    prev.rank === next.rank &&
    prev.coin.id === next.coin.id &&
    prev.coin.current_price === next.coin.current_price &&
    prev.coin.price_change_percentage_24h === next.coin.price_change_percentage_24h &&
    prev.coin.market_cap === next.coin.market_cap &&
    prev.coin.image === next.coin.image
  );
});
