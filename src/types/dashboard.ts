export interface OrderStatusSummary {
    total: number;
    byStatus: Record<string, number>;
}

export interface DeliveryStatusSummary {
    total: number;
    byStatus: Record<string, number>;
    pendingCount: number;
    deliveredCount: number;
}

export interface ServiceLevelSummary {
    totalDeliveriesPlannedInRange: number;
    totalDeliveriesDeliveredInRange: number;
    onTimeDeliveredCount: number;
    onTimeRate: number;
}

export interface LowStockAlert {
    franchiseId: number;
    franchiseName: string;
    ingredientId: number;
    ingredientName: string;
    unit: string;
    onHandQuantity: number;
    safetyStock: number;
}

export interface NearExpiryAlert {
    franchiseId: number;
    franchiseName: string;
    ingredientId: number;
    ingredientName: string;
    unit: string;
    batchId: number;
    batchCode: string;
    quantity: number;
    expiredAt: string;
    daysToExpire: number;
}

export interface WasteAlert {
    franchiseId: number;
    franchiseName: string;
    ingredientId: number;
    ingredientName: string;
    unit: string;
    wasteQuantity: number;
    issuedQuantity: number;
    wasteRate: number;
    wasteThreshold: number;
    isExceedThreshold: boolean;
}

export interface DashboardOverview {
    fromDate: string;
    toDate: string;
    timezoneOffsetMinutes: number;
    franchiseCount: number;
    orderStatusSummary: OrderStatusSummary;
    deliveryStatusSummary: DeliveryStatusSummary;
    serviceLevelSummary: ServiceLevelSummary;
    lowStockAlerts: LowStockAlert[];
    nearExpiryAlerts: NearExpiryAlert[];
    wasteAlerts: WasteAlert[];
    notes: string[];
}

export interface DashboardOverviewParams {
    fromDate?: string;
    toDate?: string;
    timezoneOffsetMinutes?: number;
    limit?: number;
}
