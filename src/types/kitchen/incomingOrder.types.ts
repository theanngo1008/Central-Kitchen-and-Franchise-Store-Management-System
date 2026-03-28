export type IncomingOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "LOCKED"
  | "RECEIVED_BY_KITCHEN"
  | "FORWARDED_TO_SUPPLY"
  | "PREPARING"
  | "READY_TO_DELIVER"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RECEIVED_BY_STORE"
  | "CANCELLED";

export interface IncomingOrderAvailableBatch {
  batchId: number;
  batchCode: string;
  quantity: number;
  createdAt?: string | null;
  expiredAt?: string | null;
}

export interface IncomingOrderItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;

  sku?: string | null;
  productStatus?: string | null;

  // Inventory check in central kitchen
  availableInCentralKitchenQuantity?: number | null;
  isSufficientInCentralKitchen?: boolean | null;
  availableCentralKitchenBatches?: IncomingOrderAvailableBatch[] | null;

  // Forward result (sanitized values from BE)
  forwardedQuantity?: number | null;
  droppedQuantity?: number | null;
  isDroppedFromForward?: boolean | null;
  dropReason?: string | null;

  // Legacy fallback - keep temporarily if old BE data still exists
  isDropped?: boolean | null;

  // Diagnostic / raw snapshot fields from BE
  hasForwardSnapshot?: boolean | null;
  isForwardSnapshotConsistent?: boolean | null;
  forwardSnapshotWarning?: string | null;
  rawForwardSnapshotRequestedQuantity?: number | null;
  rawForwardSnapshotForwardedQuantity?: number | null;
  rawForwardSnapshotDroppedQuantity?: number | null;
}

export interface IncomingOrderIngredientItem {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;

  ingredientStatus?: string | null;

  availableInCentralKitchenQuantity?: number | null;
  isSufficientInCentralKitchen?: boolean | null;
  availableCentralKitchenBatches?: IncomingOrderAvailableBatch[] | null;

  forwardedQuantity?: number | null;
  droppedQuantity?: number | null;
  isDroppedFromForward?: boolean | null;
  dropReason?: string | null;

  hasForwardSnapshot?: boolean | null;
  isForwardSnapshotConsistent?: boolean | null;
  forwardSnapshotWarning?: string | null;
}

export interface IncomingOrder {
  storeOrderId: number;
  orderCode: string;
  requestedDeliveryDate: string;
  storeId: number;
  storeName: string;
  storeNote?: string | null;
  storeAddress?: string | null;

  franchiseId: number; // Deprecated: use storeId
  franchiseName: string; // Deprecated: use storeName
  orderDate: string; // Deprecated: use requestedDeliveryDate

  status: IncomingOrderStatus;

  createdAt: string;
  updatedAt: string;

  submittedAt?: string | null;
  lockedAt?: string | null;
  cancelledAt?: string | null;

  cancelReason?: string | null;

  receivedAt?: string | null;
  receivedBy?: string | null;
  receiveNote?: string | null;

  processingNote?: string | null;
  processingNoteUpdatedAt?: string | null;
  processingNoteUpdatedBy?: string | null;

  forwardedAt?: string | null;
  forwardedBy?: string | null;
  forwardNote?: string | null;

  preparedAt?: string | null;
  preparedBy?: string | null;
  preparingNote?: string | null;

  updatedBy?: string | null;
  statusNote?: string | null;

  totalItems: number;
  totalQuantity: number;
  forwardedTotalItems: number;
  forwardedTotalQuantity: number;
  droppedTotalItems: number;
  droppedTotalQuantity: number;

  items: IncomingOrderItem[];
  ingredientItems?: IncomingOrderIngredientItem[];
}

export interface IncomingOrderListData {
  items: IncomingOrder[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ReceiveIncomingOrderPayload {
  receiveNote?: string | null;
}

export interface ReceiveIncomingOrderResponse {
  storeOrderId: number;
  status: IncomingOrderStatus;
  receivedAt?: string | null;
  receivedBy?: string | null;
  receiveNote?: string | null;
  storeNote?: string | null;
  storeAddress?: string | null;

  processingNote?: string | null;
  processingNoteUpdatedAt?: string | null;
  processingNoteUpdatedBy?: string | null;

  forwardedAt?: string | null;
  forwardedBy?: string | null;
  forwardNote?: string | null;

  preparedAt?: string | null;
  preparedBy?: string | null;
  preparingNote?: string | null;

  updatedAt?: string | null;
  updatedBy?: string | null;
  statusNote?: string | null;

  totalItems?: number;
  totalQuantity?: number;
  forwardedTotalItems?: number;
  forwardedTotalQuantity?: number;
  droppedTotalItems?: number;
  droppedTotalQuantity?: number;

  message?: string | null;
}

export interface UpdateProcessingNotePayload {
  processingNote: string;
}

export interface UpdateProcessingNoteResponse {
  storeOrderId: number;
  status: IncomingOrderStatus;
  receivedAt?: string | null;
  receivedBy?: string | null;
  receiveNote?: string | null;
  storeNote?: string | null;
  storeAddress?: string | null;

  processingNote?: string | null;
  processingNoteUpdatedAt?: string | null;
  processingNoteUpdatedBy?: string | null;

  forwardedAt?: string | null;
  forwardedBy?: string | null;
  forwardNote?: string | null;

  preparedAt?: string | null;
  preparedBy?: string | null;
  preparingNote?: string | null;

  updatedAt?: string | null;
  updatedBy?: string | null;
  statusNote?: string | null;

  message?: string | null;
}

export interface ForwardIncomingOrderPayload {
  forwardNote?: string | null;
}

export interface ForwardIncomingOrderResponse {
  storeOrderId: number;
  status: IncomingOrderStatus;
  receivedAt?: string | null;
  receivedBy?: string | null;
  receiveNote?: string | null;
  storeNote?: string | null;
  storeAddress?: string | null;

  processingNote?: string | null;
  processingNoteUpdatedAt?: string | null;
  processingNoteUpdatedBy?: string | null;

  forwardedAt?: string | null;
  forwardedBy?: string | null;
  forwardNote?: string | null;

  preparedAt?: string | null;
  preparedBy?: string | null;
  preparingNote?: string | null;

  updatedAt?: string | null;
  updatedBy?: string | null;
  statusNote?: string | null;

  totalItems?: number;
  totalQuantity?: number;
  forwardedTotalItems?: number;
  forwardedTotalQuantity?: number;
  droppedTotalItems?: number;
  droppedTotalQuantity?: number;

  message?: string | null;
}

export interface IncomingOrderHistoryItem {
  historyId: number;
  storeOrderId: number;
  actionType: string;
  actionLabel: string;
  performedAt: string;
  performedBy?: string | null;
  note?: string | null;
  oldStatus?: IncomingOrderStatus | null;
  newStatus?: IncomingOrderStatus | null;
}