import { useMutation } from "@tanstack/react-query";
import { productionPlansApi } from "@/api/kitchen/productionPlansApi";
import type { UpdateProductionPlanStatusPayload } from "@/types/kitchen/productionPlan.types";

export const useUpdateProductionPlanStatus = (
  centralKitchenId: number,
  productionPlanId: number
) => {
  return useMutation({
    mutationFn: (payload: UpdateProductionPlanStatusPayload) =>
      productionPlansApi.updateStatus(centralKitchenId, productionPlanId, payload),
  });
};