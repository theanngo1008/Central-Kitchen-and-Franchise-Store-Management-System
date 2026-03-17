import { useMutation } from "@tanstack/react-query";
import { productionPlansApi } from "@/api/kitchen/productionPlansApi";

export const useProductionPlanByDate = (centralKitchenId: number) => {
  return useMutation({
    mutationFn: (planDate: string) =>
      productionPlansApi.getByDate(centralKitchenId, planDate),
  });
};