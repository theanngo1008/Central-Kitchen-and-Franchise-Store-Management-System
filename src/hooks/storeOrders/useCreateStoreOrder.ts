import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeOrdersApi } from '@/api/store/storeOrdersApi';
import type { CreateStoreOrderPayload } from '@/types/store/storeOrder.types';

export const useCreateStoreOrder = (franchiseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStoreOrderPayload) =>
      storeOrdersApi.create(franchiseId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', franchiseId] });
    },
  });
};