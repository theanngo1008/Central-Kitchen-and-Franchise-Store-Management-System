import { get } from "@/api";
import { unwrapResponse } from "@/api/unwrapResponse";
import type {
  StoreInventoryBatchLifecycle,
  StoreInventoryHistoryItemType,
  StoreInventoryHistoryMovementListData,
  StoreInventoryHistoryMovementsParams,
} from "@/types/store/inventoryHistory.types";

const ENDPOINT = "/franchises";

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

export const getStoreInventoryHistoryMovements = async (
  franchiseId: number,
  params?: StoreInventoryHistoryMovementsParams,
): Promise<StoreInventoryHistoryMovementListData> => {
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

  const res = await get(
    `${ENDPOINT}/${franchiseId}/inventory/history/movements${query}`,
  );

  return unwrapResponse<StoreInventoryHistoryMovementListData>(res);
};

export const getStoreInventoryBatchLifecycle = async (
  franchiseId: number,
  batchId: number,
  itemType?: StoreInventoryHistoryItemType,
): Promise<StoreInventoryBatchLifecycle> => {
  const query = buildQueryString({ itemType });

  const res = await get(
    `${ENDPOINT}/${franchiseId}/inventory/history/batches/${batchId}${query}`,
  );

  return unwrapResponse<StoreInventoryBatchLifecycle>(res);
};