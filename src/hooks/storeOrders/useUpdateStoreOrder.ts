import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeOrdersApi } from '@/api/store/storeOrdersApi';
import type { UpdateStoreOrderPayload } from '@/types/store/storeOrder.types';

export const useUpdateStoreOrder = (franchiseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: number; payload: UpdateStoreOrderPayload }) =>
      storeOrdersApi.update(franchiseId, orderId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', franchiseId] });
    },
  });
};