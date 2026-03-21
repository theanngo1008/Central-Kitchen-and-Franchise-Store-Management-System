export interface ReceivingListItemResponse {
    receivingId: number;
    deliveryCode: string;
    franchiseId: number;
    centralKitchenId: number;
    centralKitchenName: string;
    planDate: string; // YYYY-MM-DD
    deliveryDate: string; // ISO DateTime
    createdAt: string; // ISO DateTime
    status: string;
    totalItems: number;
    totalQuantity: number;
    storeOrderId?: number;
    orderCode?: string;
}

export interface ReceivingDetailLineResponse {
    itemType: 'PRODUCT' | 'INGREDIENT';
    itemId: number;
    itemName: string;
    unit: string;
    expectedQuantity: number;
    deliveredQuantity: number;
    receivedQuantity?: number;
}

export interface ReceivingDetailResponse {
    receivingId: number;
    deliveryCode: string;
    status: string;
    centralKitchenId: number;
    centralKitchenName: string;
    franchiseId: number;
    franchiseName: string;
    planDate: string; // YYYY-MM-DD
    deliveryDate: string; // ISO DateTime
    createdAt: string; // ISO DateTime
    note?: string;
    storeOrderId?: number;
    orderCode?: string;
    items: ReceivingDetailLineResponse[];
}

export interface ConfirmReceivingLineRequest {
    itemType: 'PRODUCT' | 'INGREDIENT';
    itemId: number;
    receivedQuantity: number;
}

export interface ConfirmReceivingRequest {
    note?: string;
    items: ConfirmReceivingLineRequest[];
}


export interface ReceivingConfirmResponse {
    receivingId: number;
    deliveryCode: string;
    status: string;
    confirmedAt: string;
    inventoryUpdated: boolean;
}
