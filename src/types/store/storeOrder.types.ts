export type StoreOrderStatus =
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

export interface StoreOrderItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  sku?: string | null;

  // Fulfillment info (populated after order forwarded to supply)
  forwardedQuantity?: number | null;
  droppedQuantity?: number | null;
  isDroppedFromForward?: boolean | null;
  dropReason?: string | null;
}

export interface StoreOrderIngredientItem {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;

  forwardedQuantity?: number | null;
  droppedQuantity?: number | null;
  isDroppedFromForward?: boolean | null;
  dropReason?: string | null;
}

export interface StoreOrder {
  storeOrderId: number;
  orderCode?: string | null;
  franchiseId: number;
  requestedDeliveryDate?: string | null;

  status: StoreOrderStatus;

  orderDate: string;

  createdAt: string;
  updatedAt: string;

  submittedAt?: string | null;
  lockedAt?: string | null;
  cancelledAt?: string | null;

  cancelReason?: string | null;

  // Aggregated fulfillment totals
  totalItems?: number | null;
  totalQuantity?: number | null;
  forwardedTotalItems?: number | null;
  forwardedTotalQuantity?: number | null;
  droppedTotalItems?: number | null;
  droppedTotalQuantity?: number | null;

  forwardedAt?: string | null;
  forwardedBy?: string | null;
  forwardNote?: string | null;
  processingNote?: string | null;

  items: StoreOrderItem[];
  ingredientItems?: StoreOrderIngredientItem[];
}

export interface StoreOrderListData {
  items: StoreOrder[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StoreOrderQuery {
  Status?: string;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
  SortBy?: string;
  SortDir?: string;
}

export interface CreateStoreOrderPayload {
  orderDate: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  ingredientItems?: {
    ingredientId: number;
    quantity: number;
  }[];
}

export interface UpdateStoreOrderPayload {
  orderDate: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  ingredientItems?: {
    ingredientId: number;
    quantity: number;
  }[];
}

export interface CancelStoreOrderPayload {
  reason: string;
}