import type { KitchenInventoryHistoryMovement } from "@/types/kitchen/inventoryHistory.types";

export type InventoryHistoryTableRow = KitchenInventoryHistoryMovement & {
  id: string;
};