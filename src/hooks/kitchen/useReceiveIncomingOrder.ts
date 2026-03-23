import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incomingOrdersApi } from "@/api/kitchen/incomingOrdersApi";
import type {
  ReceiveIncomingOrderPayload,
  ReceiveIncomingOrderResponse,
} from "@/types/kitchen/incomingOrder.types";

type Variables = {
  centralKitchenId: number;
  orderId: number;
  payload?: ReceiveIncomingOrderPayload;
};

export const useReceiveIncomingOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<ReceiveIncomingOrderResponse, Error, Variables>({
    mutationFn: async ({ centralKitchenId, orderId, payload }) =>
      incomingOrdersApi.receive(centralKitchenId, orderId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["incomingOrders", variables.centralKitchenId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "incomingOrderDetail",
          variables.centralKitchenId,
          variables.orderId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "incomingOrderHistory",
          variables.centralKitchenId,
          variables.orderId,
        ],
      });
    },
  });
};