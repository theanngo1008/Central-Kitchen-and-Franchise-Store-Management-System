export type ReceivingStatus =
  | "PREPARING"
  | "READY_TO_DELIVER"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RECEIVED_BY_STORE";

export type ReceivingItemType = "PRODUCT" | "INGREDIENT";

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

export interface ConfirmReceivingItemPayload {
  itemType: ReceivingItemType | string;
  itemId: number;
  receivedQuantity: number;
}

export interface ConfirmReceivingPayload {
  note: string;
  items: ConfirmReceivingItemPayload[];
}