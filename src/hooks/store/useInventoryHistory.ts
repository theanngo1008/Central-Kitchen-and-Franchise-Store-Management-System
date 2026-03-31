import { useQuery } from "@tanstack/react-query";
import {
  getStoreInventoryBatchLifecycle,
  getStoreInventoryHistoryMovements,
} from "@/api/store/inventoryHistoryApi";
import type {
  StoreInventoryHistoryItemType,
  StoreInventoryHistoryMovementsParams,
} from "@/types/store/inventoryHistory.types";

export const storeInventoryHistoryKeys = {
  all: ["storeInventoryHistory"] as const,

  movements: (
    franchiseId: number,
    params?: StoreInventoryHistoryMovementsParams,
  ) =>
    ["storeInventoryHistory", "movements", franchiseId, params] as const,

  batchLifecycle: (
    franchiseId: number,
    batchId: number,
    itemType?: StoreInventoryHistoryItemType,
  ) =>
    [
      "storeInventoryHistory",
      "batchLifecycle",
      franchiseId,
      batchId,
      itemType ?? "UNKNOWN",
    ] as const,
};

export function useStoreInventoryHistoryMovements(
  franchiseId?: number,
  params?: StoreInventoryHistoryMovementsParams,
) {
  return useQuery({
    queryKey: storeInventoryHistoryKeys.movements(Number(franchiseId), params),
    queryFn: () =>
      getStoreInventoryHistoryMovements(Number(franchiseId), params),
    enabled: !!franchiseId,
  });
}

export function useStoreInventoryBatchLifecycle(
  franchiseId?: number,
  batchId?: number | null,
  itemType?: StoreInventoryHistoryItemType,
) {
  return useQuery({
    queryKey: storeInventoryHistoryKeys.batchLifecycle(
      Number(franchiseId),
      Number(batchId),
      itemType,
    ),
    queryFn: () =>
      getStoreInventoryBatchLifecycle(
        Number(franchiseId),
        Number(batchId),
        itemType,
      ),
    enabled: !!franchiseId && !!batchId,
  });
}