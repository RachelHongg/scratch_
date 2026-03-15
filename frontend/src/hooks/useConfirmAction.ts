import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { confirmCoin } from '../lib/api';
import { ConfirmContext } from '../contexts/ConfirmContext';

export function useConfirmAction() {
  const { dispatch } = useContext(ConfirmContext);

  const mutation = useMutation({
    mutationFn: confirmCoin,
    onMutate: (coinId: string) => {
      dispatch({ type: 'START', coinId });
    },
    onSuccess: (data) => {
      if (data.status === 'confirmed') {
        dispatch({ type: 'SUCCESS', coinId: data.coin_id });
      } else {
        dispatch({ type: 'FAIL', coinId: data.coin_id });
      }
    },
    onError: (_error, coinId) => {
      dispatch({ type: 'FAIL', coinId });
    },
  });

  return { confirm: (coinId: string) => mutation.mutate(coinId) };
}
