export type ReceivingStatus =
  | "PREPARING"
  | "READY_TO_DELIVER"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RECEIVED_BY_STORE";

export type ReceivingItemType = "PRODUCT" | "INGREDIENT";

export interface ReceivingBatchDetail {
  batchId: number;
  batchCode: string;
  quantity: number;
  createdAt: string;
  expiredAt?: string | null;
}

export interface PendingReceivingItem {
  receivingId: number;
  deliveryCode: string;
  orderCode?: string | null;
  franchiseId?: number;
  centralKitchenId?: number;
  centralKitchenName: string;
  planDate: string;
  deliveryDate?: string | null;
  createdAt?: string;
  status: ReceivingStatus | string;
  canConfirm?: boolean;
  totalItems: number;
  totalQuantity: number;
  storeOrderId?: number;
}

export interface ReceivingDetailItem {
  itemId: number;
  itemName: string;
  itemType: ReceivingItemType | string;
  unit: string;
  expectedQuantity?: number;
  deliveredQuantity: number;
  receivedQuantity?: number;

  // New fields from backend (Transit Stock Logic)
  availableInCentralKitchenQuantity?: number;
  availableCentralKitchenBatches?: ReceivingBatchDetail[];
  creditedToFranchiseQuantity?: number;
  creditedToFranchiseBatches?: ReceivingBatchDetail[];

  // Backend drop fields from ReceivingDetailResponse
  isDropped?: boolean | null;
  droppedQuantity?: number | null;
  dropReason?: string | null;
}

export interface ReceivingDetail {
  receivingId: number;
  deliveryCode: string;
  orderCode?: string | null;
  storeOrderId?: number;
  franchiseId?: number;
  franchiseName?: string;
  centralKitchenId?: number;
  centralKitchenName: string;
  planDate: string;
  deliveryDate?: string | null;
  createdAt?: string;
  status: ReceivingStatus | string;
  canConfirm?: boolean;
  note?: string | null;
  items: ReceivingDetailItem[];
}

export interface ConfirmReceivingPayload {
  note: string;
}