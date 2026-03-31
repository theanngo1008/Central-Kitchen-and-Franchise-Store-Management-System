import type { KitchenInventoryTab } from "./inventoryBatch.types";

export type InventoryHistoryItemType = KitchenInventoryTab;
export type InventoryHistoryScopeType = "CENTRAL_KITCHEN" | "FRANCHISE";
export type InventoryHistoryStockBucket = "ON_HAND" | "TRANSIT";

export type InventoryHistoryEventType =
  | "Inbound"
  | "Adjust"
  | "Waste"
  | "IssueProd"
  | "PrepareOut"
  | "TransitIn"
  | "TransitOut"
  | "ReceiveIn"
  | "Rename"
  | "Archive"
  | "Reverse";

export type InventoryHistorySortDir = "asc" | "desc";

export interface KitchenInventoryHistoryMovementsParams {
  itemType?: InventoryHistoryItemType;
  itemId?: number;
  batchId?: number;
  eventType?: InventoryHistoryEventType;
  deliveryId?: number;
  fromUtc?: string;
  toUtc?: string;
  sortDir?: InventoryHistorySortDir;
  page?: number;
  pageSize?: number;
}

export interface KitchenInventoryHistoryMovement {
  inventoryLedgerEntryId: number;
  correlationId: string;
  sequenceNo: number;
  occurredAtUtc: string;
  itemType: InventoryHistoryItemType;
  itemId: number;
  itemName: string;
  itemUnit: string;
  batchId: number;
  batchCode: string;
  batchCreatedAtUtc?: string | null;
  expiredAt?: string | null;
  scopeType: InventoryHistoryScopeType;
  scopeId: number;
  scopeName: string;
  stockBucket: InventoryHistoryStockBucket;
  deltaQuantity: number;
  eventType: InventoryHistoryEventType;
  isNonStockEvent: boolean;
  reason?: string | null;
  actorUserId?: number | null;
  actorDisplay?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  deliveryId?: number | null;
  deliveryCode?: string | null;
  deliveryStatus?: string | null;
  deliveryPlanId?: number | null;
  storeOrderId?: number | null;
  orderCode?: string | null;
  orderStatus?: string | null;
  requestedQuantitySnapshot?: number | null;
  actualQuantitySnapshot?: number | null;
  droppedQuantitySnapshot?: number | null;
  dropReasonSnapshot?: string | null;
  counterpartyScopeType?: InventoryHistoryScopeType | null;
  counterpartyScopeId?: number | null;
  counterpartyScopeName?: string | null;
  counterpartyBatchId?: number | null;
  metadataJson?: string | null;
}

export interface KitchenInventoryHistoryMovementListData {
  items: KitchenInventoryHistoryMovement[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface KitchenInventoryBatchLifecycle {
  batchId: number;
  itemType: InventoryHistoryItemType;
  itemId: number;
  itemName: string;
  itemUnit: string;
  scopeType: InventoryHistoryScopeType;
  scopeId: number;
  scopeName: string;
  batchCode: string;
  batchCreatedAtUtc?: string | null;
  expiredAt?: string | null;
  currentBatchExists: boolean;
  currentBatchCode?: string | null;
  currentQuantity?: number | null;
  currentIsInTransit?: boolean | null;
  currentBucket?: InventoryHistoryStockBucket | null;
  currentDeliveryId?: number | null;
  currentDeliveryCode?: string | null;
  timeline: KitchenInventoryHistoryMovement[];
}