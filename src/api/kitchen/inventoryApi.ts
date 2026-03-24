import adminApi from "../api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type {
  IssueIngredientsByProductionPlanPayload,
  IssueIngredientsByProductionPlanResult,
} from "@/types/kitchen/inventoryIssue.types";
import type {
  AdjustIngredientBatchPayload,
  AdjustProductBatchPayload,
  CreateIngredientInboundPayload,
  CreateProductInboundPayload,
  IngredientAdjustmentResult,
  IngredientBatch,
  IngredientBatchListParams,
  ProductAdjustmentResult,
  ProductBatch,
  ProductBatchListParams,
  UpdateBatchCodePayload,
} from "@/types/kitchen/inventoryBatch.types";

const buildQueryString = (params?: Record<string, unknown>) => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const inventoryApi = {
  issueIngredientsByProductionPlan: async (
    centralKitchenId: number,
    productionPlanId: number,
    payload: IssueIngredientsByProductionPlanPayload,
  ) =>
    (
      await adminApi.post<ApiResponse<IssueIngredientsByProductionPlanResult>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/issue-by-production-plan/${productionPlanId}`,
        payload,
      )
    ).data,

  getIngredientBatches: async (
    centralKitchenId: number,
    params?: IngredientBatchListParams,
  ) => {
    const query = buildQueryString({
      ingredientId: params?.ingredientId,
      includeZero: params?.includeZero ?? false,
    });

    return (
      await adminApi.get<ApiResponse<IngredientBatch[]>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/batches${query}`,
      )
    ).data;
  },

  getProductBatches: async (
    centralKitchenId: number,
    params?: ProductBatchListParams,
  ) => {
    const query = buildQueryString({
      productId: params?.productId,
      includeZero: params?.includeZero ?? false,
    });

    return (
      await adminApi.get<ApiResponse<ProductBatch[]>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/batches${query}`,
      )
    ).data;
  },

  getIngredientBatchDetail: async (centralKitchenId: number, batchId: number) =>
    (
      await adminApi.get<ApiResponse<IngredientBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/batches/${batchId}`,
      )
    ).data,

  getProductBatchDetail: async (centralKitchenId: number, batchId: number) =>
    (
      await adminApi.get<ApiResponse<ProductBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/batches/${batchId}`,
      )
    ).data,

  createIngredientInboundBatch: async (
    centralKitchenId: number,
    payload: CreateIngredientInboundPayload,
  ) =>
    (
      await adminApi.post<ApiResponse<IngredientBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/inbound`,
        payload,
      )
    ).data,

  createProductInboundBatch: async (
    centralKitchenId: number,
    payload: CreateProductInboundPayload,
  ) =>
    (
      await adminApi.post<ApiResponse<ProductBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/inbound`,
        payload,
      )
    ).data,

  adjustIngredientBatch: async (
    centralKitchenId: number,
    payload: AdjustIngredientBatchPayload,
  ) =>
    (
      await adminApi.post<ApiResponse<IngredientAdjustmentResult>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/adjustment`,
        payload,
      )
    ).data,

  adjustProductBatch: async (
    centralKitchenId: number,
    payload: AdjustProductBatchPayload,
  ) =>
    (
      await adminApi.post<ApiResponse<ProductAdjustmentResult>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/adjustment`,
        payload,
      )
    ).data,

  renameIngredientBatchCode: async (
    centralKitchenId: number,
    batchId: number,
    payload: UpdateBatchCodePayload,
  ) =>
    (
      await adminApi.put<ApiResponse<IngredientBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/batches/${batchId}/batch-code`,
        payload,
      )
    ).data,

  renameProductBatchCode: async (
    centralKitchenId: number,
    batchId: number,
    payload: UpdateBatchCodePayload,
  ) =>
    (
      await adminApi.put<ApiResponse<ProductBatch>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/batches/${batchId}/batch-code`,
        payload,
      )
    ).data,

  deleteIngredientBatch: async (centralKitchenId: number, batchId: number) =>
    (
      await adminApi.delete<ApiResponse<string>>(
        `/central-kitchens/${centralKitchenId}/inventory/ingredients/batches/${batchId}`,
      )
    ).data,

  deleteProductBatch: async (centralKitchenId: number, batchId: number) =>
    (
      await adminApi.delete<ApiResponse<string>>(
        `/central-kitchens/${centralKitchenId}/inventory/products/batches/${batchId}`,
      )
    ).data,
};
