import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeOrdersApi } from '@/api/store/storeOrdersApi';
import type { CancelStoreOrderPayload } from '@/types/store/storeOrder.types';

export const useCancelStoreOrder = (franchiseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: CancelStoreOrderPayload }) =>
      storeOrdersApi.cancel(franchiseId, orderId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', franchiseId] });
    },
  });
};