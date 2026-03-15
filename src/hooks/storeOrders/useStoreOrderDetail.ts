import { useQuery } from "@tanstack/react-query";
import { storeOrdersApi } from "@/api/store/storeOrdersApi";

export const useStoreOrderDetail = (
  franchiseId: number,
  orderId: number
) => {
  return useQuery({
    queryKey: ["storeOrderDetail", franchiseId, orderId],
    queryFn: () => storeOrdersApi.detail(franchiseId, orderId),
    enabled: !!franchiseId && !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};