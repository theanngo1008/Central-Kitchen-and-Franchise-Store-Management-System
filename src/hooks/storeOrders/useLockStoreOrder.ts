import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeOrdersApi } from '@/api/store/storeOrdersApi';

export const useLockStoreOrder = (franchiseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => storeOrdersApi.lock(franchiseId, orderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', franchiseId] });
    },
  });
};