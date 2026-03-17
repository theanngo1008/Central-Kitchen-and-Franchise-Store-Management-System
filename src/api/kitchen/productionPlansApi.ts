import adminApi from "../api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type {
  CreateProductionPlanPayload,
  ProductionPlanDetail,
  UpdateProductionPlanStatusPayload,
} from "@/types/kitchen/productionPlan.types";

export const productionPlansApi = {
  create: async (
    centralKitchenId: number,
    payload: CreateProductionPlanPayload
  ) =>
    (
      await adminApi.post<ApiResponse<ProductionPlanDetail>>(
        `/central-kitchens/${centralKitchenId}/production-plans`,
        payload
      )
    ).data,

  detail: async (centralKitchenId: number, productionPlanId: number) =>
    (
      await adminApi.get<ApiResponse<ProductionPlanDetail>>(
        `/central-kitchens/${centralKitchenId}/production-plans/${productionPlanId}`
      )
    ).data,

  getByDate: async (centralKitchenId: number, planDate: string) =>
    (
      await adminApi.get<ApiResponse<ProductionPlanDetail>>(
        `/central-kitchens/${centralKitchenId}/production-plans/by-date`,
        {
          params: { planDate },
        }
      )
    ).data,

  updateStatus: async (
    centralKitchenId: number,
    productionPlanId: number,
    payload: UpdateProductionPlanStatusPayload
  ) =>
    (
      await adminApi.patch<ApiResponse<ProductionPlanDetail>>(
        `/central-kitchens/${centralKitchenId}/production-plans/${productionPlanId}/status`,
        payload
      )
    ).data,
};