export type StoreInventoryHistoryItemType = "INGREDIENT" | "PRODUCT";
export type StoreInventoryHistoryScopeType = "FRANCHISE" | "CENTRAL_KITCHEN";
export type StoreInventoryHistoryStockBucket = "ON_HAND" | "TRANSIT";

export type StoreInventoryHistoryEventType =
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

export type StoreInventoryHistorySortDir = "asc" | "desc";

export interface StoreInventoryHistoryMovementsParams {
  itemType?: StoreInventoryHistoryItemType;
  itemId?: number;
  batchId?: number;
  eventType?: StoreInventoryHistoryEventType;
  deliveryId?: number;
  fromUtc?: string;
  toUtc?: string;
  sortDir?: StoreInventoryHistorySortDir;
  page?: number;
  pageSize?: number;
}

export interface StoreInventoryHistoryMovement {
  inventoryLedgerEntryId: number;
  correlationId: string;
  sequenceNo: number;
  occurredAtUtc: string;
  itemType: StoreInventoryHistoryItemType;
  itemId: number;
  itemName: string;
  itemUnit: string;
  batchId: number;
  batchCode: string;
  batchCreatedAtUtc?: string | null;
  expiredAt?: string | null;
  scopeType: StoreInventoryHistoryScopeType;
  scopeId: number;
  scopeName: string;
  stockBucket: StoreInventoryHistoryStockBucket;
  deltaQuantity: number;
  eventType: StoreInventoryHistoryEventType;
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
  counterpartyScopeType?: StoreInventoryHistoryScopeType | null;
  counterpartyScopeId?: number | null;
  counterpartyScopeName?: string | null;
  counterpartyBatchId?: number | null;
  metadataJson?: string | null;
}

export interface StoreInventoryHistoryMovementListData {
  items: StoreInventoryHistoryMovement[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StoreInventoryBatchLifecycle {
  batchId: number;
  itemType: StoreInventoryHistoryItemType;
  itemId: number;
  itemName: string;
  itemUnit: string;
  scopeType: StoreInventoryHistoryScopeType;
  scopeId: number;
  scopeName: string;
  batchCode: string;
  batchCreatedAtUtc?: string | null;
  expiredAt?: string | null;
  currentBatchExists: boolean;
  currentBatchCode?: string | null;
  currentQuantity?: number | null;
  currentIsInTransit?: boolean | null;
  currentBucket?: StoreInventoryHistoryStockBucket | null;
  currentDeliveryId?: number | null;
  currentDeliveryCode?: string | null;
  timeline: StoreInventoryHistoryMovement[];
}