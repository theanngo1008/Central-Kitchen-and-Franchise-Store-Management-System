export interface DemandProduct {
    productId: number;
    name: string;
    sku: string;
    unit: string;
    status: string;
    productType: string;
}

export interface DemandItem {
    demandItemId: number;
    demandAggregationId: number;
    productId: number;
    quantity: number;
    product?: DemandProduct;
}

export interface DemandAggregation {
    demandAggregationId: number;
    planDate: string;
    createdAt: string;
    demandItems?: DemandItem[];
}

export interface CreateDemandPayload {
    planDate: string;
}

export interface DemandItemPayload {
    productId: number;
    quantity: number;
}
