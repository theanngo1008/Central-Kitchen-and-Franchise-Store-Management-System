import { useQuery } from "@tanstack/react-query";
import { kitchenInventoryHistoryApi } from "@/api/kitchen/kitchenInventoryHistory";
import type {
  InventoryHistoryItemType,
  KitchenInventoryHistoryMovementsParams,
} from "@/types/kitchen/inventoryHistory.types";

export const kitchenInventoryHistoryKeys = {
  all: ["kitchenInventoryHistory"] as const,

  movements: (
    centralKitchenId: number,
    params?: KitchenInventoryHistoryMovementsParams,
  ) =>
    [
      "kitchenInventoryHistory",
      "movements",
      centralKitchenId,
      params,
    ] as const,

  batchLifecycle: (
    centralKitchenId: number,
    batchId: number,
    itemType?: InventoryHistoryItemType,
  ) =>
    [
      "kitchenInventoryHistory",
      "batchLifecycle",
      centralKitchenId,
      batchId,
      itemType ?? "UNKNOWN",
    ] as const,
};

export const useKitchenInventoryHistoryMovements = (
  centralKitchenId?: number,
  params?: KitchenInventoryHistoryMovementsParams,
) => {
  return useQuery({
    queryKey: kitchenInventoryHistoryKeys.movements(
      Number(centralKitchenId),
      params,
    ),
    queryFn: async () => {
      const res = await kitchenInventoryHistoryApi.getMovements(
        Number(centralKitchenId),
        params,
      );

      return (
        res.data ?? {
          items: [],
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          totalItems: 0,
          totalPages: 0,
        }
      );
    },
    enabled: !!centralKitchenId,
  });
};

export const useKitchenBatchLifecycle = (
  centralKitchenId?: number,
  batchId?: number | null,
  itemType?: InventoryHistoryItemType,
) => {
  return useQuery({
    queryKey: kitchenInventoryHistoryKeys.batchLifecycle(
      Number(centralKitchenId),
      Number(batchId),
      itemType,
    ),
    queryFn: async () => {
      const res = await kitchenInventoryHistoryApi.getBatchLifecycle(
        Number(centralKitchenId),
        Number(batchId),
        itemType,
      );

      return res.data ?? null;
    },
    enabled: !!centralKitchenId && !!batchId,
  });
};