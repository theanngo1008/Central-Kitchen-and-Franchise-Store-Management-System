import { useQuery } from "@tanstack/react-query";
import { productionPlansApi } from "@/api/kitchen/productionPlansApi";

export const useProductionPlanDetail = (
  centralKitchenId: number,
  productionPlanId?: number
) => {
  return useQuery({
    queryKey: ["productionPlanDetail", centralKitchenId, productionPlanId],
    queryFn: () =>
      productionPlansApi.detail(centralKitchenId, productionPlanId as number),
    enabled: !!centralKitchenId && !!productionPlanId,
  });
};