import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {
  getPendingReceivings,
  getReceivingDetail,
  confirmReceiving,
} from "@/api/store/receivingApi";

import type {
  PendingReceivingItem,
  ReceivingDetail,
  ConfirmReceivingPayload,
} from "@/types/store/receiving.types";

export const PENDING_RECEIVINGS_KEY = "pending-receivings";
export const RECEIVING_DETAIL_KEY = "receiving-detail";

/**
 * =========================
 * Pending Receivings List
 * =========================
 */
export function usePendingReceivings(franchiseId: number) {
  return useQuery<PendingReceivingItem[]>({
    queryKey: [PENDING_RECEIVINGS_KEY, franchiseId],
    queryFn: () => getPendingReceivings(franchiseId),
    enabled: !!franchiseId,
  });
}

/**
 * =========================
 * Receiving Detail
 * Only run when modal open
 * =========================
 */
export function useReceivingDetail(
  franchiseId: number,
  deliveryId: number | null
) {
  return useQuery<ReceivingDetail>({
    queryKey: [RECEIVING_DETAIL_KEY, franchiseId, deliveryId],
    queryFn: () => getReceivingDetail(franchiseId, deliveryId!),

    /**
     * IMPORTANT:
     * stop query immediately when modal closes
     */
    enabled: !!franchiseId && !!deliveryId,

    /**
     * Prevent refetch flicker
     */
    staleTime: 1000 * 60,
  });
}

type ConfirmReceivingMutationInput = {
  franchiseId: number;
  deliveryId: number;
  data: ConfirmReceivingPayload;
};

/**
 * =========================
 * Confirm Receiving Mutation
 * =========================
 */
export function useConfirmReceiving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      franchiseId,
      deliveryId,
      data,
    }: ConfirmReceivingMutationInput) =>
      confirmReceiving(franchiseId, deliveryId, data),

    onSuccess: (_res, variables) => {
      toast.success("Xác nhận nhận hàng thành công!");

      /**
       * REFRESH LIST ONLY
       * Because after confirm → item disappears from pending list
       */
      queryClient.invalidateQueries({
        queryKey: [PENDING_RECEIVINGS_KEY, variables.franchiseId],
      });

      /**
       * Update inventory summary
       */
      queryClient.invalidateQueries({
        queryKey: ["store-inventory-summary", variables.franchiseId],
      });

      /**
       * CLEAN DETAIL CACHE (enterprise practice)
       */
      queryClient.removeQueries({
        queryKey: [
          RECEIVING_DETAIL_KEY,
          variables.franchiseId,
          variables.deliveryId,
        ],
      });
    },

    onError: (error: AxiosError | Error) => {
      const err = error as AxiosError<{ message?: string }>;

      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra khi nhận hàng"
      );
    },
  });
}