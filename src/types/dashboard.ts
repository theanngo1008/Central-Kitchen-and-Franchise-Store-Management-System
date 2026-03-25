export interface OrderStatusSummary {
    total: number;
    byStatus: Record<string, number>;
}

export interface DeliveryStatusSummary {
    total: number;
    byStatus: Record<string, number>;
    pendingCount: number;
    deliveredCount: number;
    deliveredPendingReceivingCount: number;
    confirmedReceivingCount: number;
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


// --- Kitchen Dashboard Types --- 

export interface KitchenDashboardOverviewQuery {
    centralKitchenId?: number;
    fromDate?: string;
    toDate?: string;
    timezoneOffsetMinutes?: number;
    limit?: number;
}

export interface KitchenOrderQueueSummary {
    total: number;
    byStatus: Record<string, number>;
    lockedCount: number;
    receivedByKitchenCount: number;
    forwardedToSupplyCount: number;
    overdueActionCount: number;
}

export interface KitchenProductionPlanSummary {
    total: number;
    byStatus: Record<string, number>;
    dueTodayOpenCount: number;
    overdueOpenCount: number;
    totalPlannedQuantity: number;
}

export interface KitchenProductionRunSummary {
    total: number;
    byStatus: Record<string, number>;
    totalRunQuantity: number;
    completedQuantity: number;
}

export interface KitchenLowStockAlertItem {
    ingredientId: number;
    ingredientName: string;
    unit: string;
    onHandQuantity: number;
    safetyStock: number;
}

export interface KitchenNearExpiryAlertItem {
    ingredientId: number;
    ingredientName: string;
    unit: string;
    batchId: number;
    batchCode: string;
    quantity: number;
    expiredAt?: string;
    daysToExpire?: number;
}

export interface KitchenActionItem {
    actionType: string;
    message: string;
    relatedId: number;
    relatedCode: string;
    businessDate?: string;
    occurredAtUtc?: string;
}

export interface KitchenDashboardOverviewResponse {
    centralKitchenId: number;
    centralKitchenName: string;
    fromDate: string;
    toDate: string;
    timezoneOffsetMinutes: number;
    managedFranchiseCount: number;
    orderQueueSummary: KitchenOrderQueueSummary;
    productionPlanSummary: KitchenProductionPlanSummary;
    productionRunSummary: KitchenProductionRunSummary;
    lowStockAlerts: KitchenLowStockAlertItem[];
    nearExpiryAlerts: KitchenNearExpiryAlertItem[];
    priorityActions: KitchenActionItem[];
    notes: string[];
}


// --- Store Dashboard Types --- 

export interface StoreDashboardOverviewQuery {
    franchiseId?: number;
    fromDate?: string;
    toDate?: string;
    timezoneOffsetMinutes?: number;
    limit?: number;
}

export interface StoreOrderSummary {
    total: number;
    byStatus: Record<string, number>;
    activeOrderCount: number;
    deliveredPendingReceivingCount: number;
    receivedCount: number;
}

export interface StoreReceivingSummary {
    pendingConfirmationCount: number;
    confirmedCount: number;
    latestDeliveredAtUtc?: string;
    latestConfirmedAtUtc?: string;
}

export interface StoreInventorySummary {
    ingredientItemCount: number;
    productItemCount: number;
    lowStockIngredientCount: number;
    nearExpiryIngredientBatchCount: number;
    totalIngredientOnHand: number;
    totalProductOnHand: number;
}

export interface StoreLowStockAlertItem {
    ingredientId: number;
    ingredientName: string;
    unit: string;
    onHandQuantity: number;
    safetyStock: number;
}

export interface StoreNearExpiryAlertItem {
    ingredientId: number;
    ingredientName: string;
    unit: string;
    batchId: number;
    batchCode: string;
    quantity: number;
    expiredAt?: string;
    daysToExpire?: number;
}

export interface StoreRecentDeliveryItem {
    deliveryId: number;
    deliveryCode: string;
    plannedDate: string;
    status: string;
    createdAt: string;
    deliveredAt?: string;
    confirmedAt?: string;
    totalItems: number;
    totalQuantity: number;
}

export interface StoreDashboardOverviewResponse {
    franchiseId: number;
    franchiseName: string;
    centralKitchenId: number;
    centralKitchenName: string;
    fromDate: string;
    toDate: string;
    timezoneOffsetMinutes: number;
    orderSummary: StoreOrderSummary;
    receivingSummary: StoreReceivingSummary;
    inventorySummary: StoreInventorySummary;
    lowStockAlerts: StoreLowStockAlertItem[];
    nearExpiryAlerts: StoreNearExpiryAlertItem[];
    recentDeliveries: StoreRecentDeliveryItem[];
    notes: string[];
}


// --- Supply Dashboard Types --- 

export interface SupplyDashboardOverviewQuery {
    centralKitchenId?: number;
    fromDate?: string;
    toDate?: string;
    timezoneOffsetMinutes?: number;
    limit?: number;
}

export interface SupplyOrderStatusSummary {
    total: number;
    byStatus: Record<string, number>;
    forwardedToSupplyCount: number;
    preparingCount: number;
    readyToDeliverCount: number;
    inTransitCount: number;
    deliveredCount: number;
}

export interface SupplyDeliveryStatusSummary {
    total: number;
    byStatus: Record<string, number>;
    deliveredPendingReceivingCount: number;
    confirmedReceivingCount: number;
}

export interface SupplyDroppedLineSummary {
    ordersWithDroppedLinesCount: number;
    droppedLinesCount: number;
    droppedQuantity: number;
}

export interface SupplyReceivingSummary {
    pendingConfirmationCount: number;
    latestDeliveredAtUtc?: string;
    latestConfirmedAtUtc?: string;
}

export interface SupplyActionItem {
    actionType: string;
    message: string;
    orderId: number;
    orderCode: string;
    franchiseId: number;
    franchiseName: string;
    businessDate: string;
    occurredAtUtc?: string;
}

export interface SupplyDashboardOverviewResponse {
    centralKitchenId: number;
    centralKitchenName: string;
    fromDate: string;
    toDate: string;
    timezoneOffsetMinutes: number;
    managedFranchiseCount: number;
    orderStatusSummary: SupplyOrderStatusSummary;
    deliveryStatusSummary: SupplyDeliveryStatusSummary;
    droppedLineSummary: SupplyDroppedLineSummary;
    receivingSummary: SupplyReceivingSummary;
    priorityActions: SupplyActionItem[];
    notes: string[];
}
