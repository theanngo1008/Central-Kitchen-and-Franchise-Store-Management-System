export type StoreOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'LOCKED'
  | 'CANCELLED';

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

  submittedAt?: string;
  lockedAt?: string;
  cancelledAt?: string;

  cancelReason?: string;

  items: StoreOrderItem[];
}

export interface StoreOrderQuery {
  status?: string;

  fromDate?: string;
  toDate?: string;

  page?: number;
  pageSize?: number;

  sortBy?: string;
  sortDir?: string;
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