import adminApi from "../api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type {
  KitchenInventoryBatchLifecycle,
  KitchenInventoryHistoryMovementListData,
  KitchenInventoryHistoryMovementsParams,
  InventoryHistoryItemType,
} from "@/types/kitchen/inventoryHistory.types";

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

export const kitchenInventoryHistoryApi = {
  getMovements: async (
    centralKitchenId: number,
    params?: KitchenInventoryHistoryMovementsParams,
  ) => {
    const query = buildQueryString({
      itemType: params?.itemType,
      itemId: params?.itemId,
      batchId: params?.batchId,
      eventType: params?.eventType,
      deliveryId: params?.deliveryId,
      fromUtc: params?.fromUtc,
      toUtc: params?.toUtc,
      sortDir: params?.sortDir,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    });

    return (
      await adminApi.get<ApiResponse<KitchenInventoryHistoryMovementListData>>(
        `/central-kitchens/${centralKitchenId}/inventory/history/movements${query}`,
      )
    ).data;
  },

  getBatchLifecycle: async (
    centralKitchenId: number,
    batchId: number,
    itemType?: InventoryHistoryItemType,
  ) => {
    const query = buildQueryString({ itemType });

    return (
      await adminApi.get<ApiResponse<KitchenInventoryBatchLifecycle>>(
        `/central-kitchens/${centralKitchenId}/inventory/history/batches/${batchId}${query}`,
      )
    ).data;
  },
};