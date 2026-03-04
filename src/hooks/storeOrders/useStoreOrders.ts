import { useQuery } from "@tanstack/react-query";
import { storeOrdersApi } from "@/api/store/storeOrdersApi";
import type { StoreOrderQuery } from "@/types/store/storeOrder.types";

export const useStoreOrders = (
  franchiseId: number,
  params?: StoreOrderQuery,
) => {
  return useQuery({
    queryKey: ["storeOrders", franchiseId, params],
    queryFn: () => storeOrdersApi.list(franchiseId, params),
    enabled: !!franchiseId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
