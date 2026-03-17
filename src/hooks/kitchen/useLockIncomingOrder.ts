import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeOrdersApi } from "@/api/store/storeOrdersApi";

type LockIncomingOrderPayload = {
  franchiseId: number;
  orderId: number;
};

export const useLockIncomingOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ franchiseId, orderId }: LockIncomingOrderPayload) =>
      storeOrdersApi.lock(franchiseId, orderId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomingOrders"] });
    },
  });
};