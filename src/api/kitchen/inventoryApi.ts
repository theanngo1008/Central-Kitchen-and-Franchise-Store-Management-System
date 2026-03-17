// src/api/kitchen/inventoryApi.ts

import adminApi from "../api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type {
  IssueIngredientsByProductionPlanPayload,
  IssueIngredientsByProductionPlanResult,
} from "@/types/kitchen/inventoryIssue.types";

export const inventoryApi = {
  issueIngredientsByProductionPlan: async (
    centralKitchenId: number,
    productionPlanId: number,
    payload: IssueIngredientsByProductionPlanPayload
  ) =>
    (
      await adminApi.post<ApiResponse<IssueIngredientsByProductionPlanResult>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/issue-by-production-plan/${productionPlanId}`,
        payload
      )
    ).data,
};