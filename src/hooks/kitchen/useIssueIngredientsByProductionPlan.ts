// src/hooks/kitchen/useIssueIngredientsByProductionPlan.ts

import { useMutation } from "@tanstack/react-query";
import { inventoryApi } from "@/api/kitchen/inventoryApi";
import type { IssueIngredientsByProductionPlanPayload } from "@/types/kitchen/inventoryIssue.types";

type IssueIngredientsMutationPayload = {
  productionPlanId: number;
  payload: IssueIngredientsByProductionPlanPayload;
};

export const useIssueIngredientsByProductionPlan = (
  centralKitchenId: number
) => {
  return useMutation({
    mutationFn: ({ productionPlanId, payload }: IssueIngredientsMutationPayload) =>
      inventoryApi.issueIngredientsByProductionPlan(
        centralKitchenId,
        productionPlanId,
        payload
      ),
  });
};