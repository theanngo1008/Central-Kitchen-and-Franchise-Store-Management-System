export type StoreOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "LOCKED"
  | "CANCELLED";

export interface StoreOrderItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
}

export interface StoreOrder {
  storeOrderId: number;
  franchiseId: number;

  status: StoreOrderStatus;

  orderDate: string;

  createdAt: string;
  updatedAt: string;

  submittedAt?: string | null;
  lockedAt?: string | null;
  cancelledAt?: string | null;

  cancelReason?: string | null;

  items: StoreOrderItem[];
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
}

export interface UpdateStoreOrderPayload {
  orderDate: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface CancelStoreOrderPayload {
  reason: string;
}