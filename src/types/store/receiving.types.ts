export type ReceivingStatus =
  | "PENDING"
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
  status: ReceivingStatus | string;
  totalItems: number;
  totalQuantity: number;
  planDate: string;
  centralKitchenName: string;
}

export interface ReceivingDetailItem {
  itemId: number;
  itemName: string;
  itemType: ReceivingItemType | string;
  deliveredQuantity: number;
  unit: string;
}

export interface ReceivingDetail {
  receivingId: number;
  deliveryCode: string;
  orderCode?: string | null;
  status: ReceivingStatus | string;
  planDate: string;
  centralKitchenName: string;
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