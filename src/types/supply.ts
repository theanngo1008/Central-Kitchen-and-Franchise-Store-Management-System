export interface SupplyOrderQueueItemLineResponse {
    productId: number;
    productName: string;
    sku?: string;
    unit: string;
    quantity: number;
}

export interface SupplyOrderQueueItemResponse {
    storeOrderId: number;
    orderCode: string;
    status: string;
    requestedDeliveryDate: string; // ISO Date String
    createdAt: string; // ISO Date String
    storeId: number;
    storeName: string;
    totalItems: number;
    totalQuantity: number;
    forwardedAt?: string;
    forwardedBy?: string;
    forwardNote?: string;
    processingNote?: string;
    items: SupplyOrderQueueItemLineResponse[];
}

export interface SupplyOrderListQuery {
    status?: string;
    franchiseId?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

export interface PrepareDeliveryRequest {
    preparingNote?: string;
}

export interface UpdateSupplyDeliveryStatusRequest {
    status: string;
    statusNote?: string;
}

export interface PaginatedSupplyOrderQueueResponse {
    items: SupplyOrderQueueItemResponse[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
