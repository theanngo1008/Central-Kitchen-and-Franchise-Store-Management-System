import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incomingOrdersApi } from "@/api/kitchen/incomingOrdersApi";
import type {
  UpdateProcessingNotePayload,
  UpdateProcessingNoteResponse,
} from "@/types/kitchen/incomingOrder.types";

type Variables = {
  centralKitchenId: number;
  orderId: number;
  payload: UpdateProcessingNotePayload;
};

export const useUpdateProcessingNote = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProcessingNoteResponse, Error, Variables>({
    mutationFn: async ({ centralKitchenId, orderId, payload }) =>
      incomingOrdersApi.updateProcessingNote(centralKitchenId, orderId, payload),

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