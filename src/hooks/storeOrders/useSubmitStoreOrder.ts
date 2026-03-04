import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeOrdersApi } from '@/api/store/storeOrdersApi';

export const useSubmitStoreOrder = (franchiseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => storeOrdersApi.submit(franchiseId, orderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', franchiseId] });
    },
  });
};