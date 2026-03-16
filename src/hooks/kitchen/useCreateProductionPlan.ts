import { useMutation } from "@tanstack/react-query";
import { productionPlansApi } from "@/api/kitchen/productionPlansApi";
import type { CreateProductionPlanPayload } from "@/types/kitchen/productionPlan.types";

export const useCreateProductionPlan = (centralKitchenId: number) => {
  return useMutation({
    mutationFn: (payload: CreateProductionPlanPayload) =>
      productionPlansApi.create(centralKitchenId, payload),
  });
};