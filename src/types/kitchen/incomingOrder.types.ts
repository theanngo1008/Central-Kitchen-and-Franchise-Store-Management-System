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

  availableInCentralKitchenQuantity?: number | null;
  isSufficientInCentralKitchen?: boolean | null;
  availableCentralKitchenBatches?: IncomingOrderAvailableBatch[] | null;
}

export interface IncomingOrder {
  storeOrderId: number;
  franchiseId: number;
  franchiseName: string;

  status: IncomingOrderStatus;

  orderDate: string;

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

  items: IncomingOrderItem[];
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

export interface UpdateProcessingNotePayload {
  processingNote: string;
}

export interface UpdateProcessingNoteResponse {
  storeOrderId: number;
  status: IncomingOrderStatus;
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