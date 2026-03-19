import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incomingOrdersApi } from "@/api/kitchen/incomingOrdersApi";
import type {
  ForwardIncomingOrderPayload,
  ForwardIncomingOrderResponse,
} from "@/types/kitchen/incomingOrder.types";

type Variables = {
  centralKitchenId: number;
  orderId: number;
  payload?: ForwardIncomingOrderPayload;
};

export const useForwardIncomingOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ForwardIncomingOrderResponse, Error, Variables>({
    mutationFn: async ({ centralKitchenId, orderId, payload }) =>
      incomingOrdersApi.forwardToSupply(centralKitchenId, orderId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["incoming-orders", variables.centralKitchenId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "incoming-order-detail",
          variables.centralKitchenId,
          variables.orderId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "incoming-order-history",
          variables.centralKitchenId,
          variables.orderId,
        ],
      });
    },
  });
};