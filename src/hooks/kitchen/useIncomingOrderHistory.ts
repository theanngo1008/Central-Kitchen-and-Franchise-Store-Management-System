import { useQuery } from "@tanstack/react-query";
import { incomingOrdersApi } from "@/api/kitchen/incomingOrdersApi";

export const useIncomingOrderHistory = (
  centralKitchenId: number,
  orderId: number
) => {
  return useQuery({
    queryKey: ["incoming-order-history", centralKitchenId, orderId],
    queryFn: () => incomingOrdersApi.history(centralKitchenId, orderId),
    enabled: !!centralKitchenId && !!orderId,
  });
};