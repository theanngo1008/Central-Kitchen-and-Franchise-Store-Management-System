export interface FranchiseSummary {
    total: number;
    active: number;
    inactive: number;
}

export interface UserSummary {
    total: number;
    active: number;
    inactive: number;
    activeUsersByRole: Record<string, number>;
}

export interface RbacSummary {
    roleActiveCount: number;
    roleInactiveCount: number;
    permissionActiveCount: number;
    permissionInactiveCount: number;
    rolePermissionLinkCount: number;
}

export interface TopAction {
    name: string;
    count: number;
}

export interface TopEntity {
    name: string;
    count: number;
}

export interface AuditActivitySummary {
    totalInRange: number;
    topActions: TopAction[];
    topEntities: TopEntity[];
    mostRecentAuditAtUtc: string | null;
}

export interface WorkloadStatus {
    name: string;
    count: number;
}

export interface WorkloadSummary {
    totalInRange: number;
    topStatuses: WorkloadStatus[];
}

export interface DataFreshness {
    latestAuditLogAtUtc: string | null;
    latestUserUpdatedAtUtc: string | null;
    latestFranchiseUpdatedAtUtc: string | null;
    latestStoreOrderAtUtc: string | null;
    latestDeliveryAtUtc: string | null;
    latestProductionPlanAtUtc: string | null;
    latestSupportRequestAtUtc: string | null;
}

export interface AdminDashboardOverview {
    fromDate: string;
    toDate: string;
    timezoneOffsetMinutes: number;

    franchiseSummary: FranchiseSummary;
    userSummary: UserSummary;
    rbacSummary: RbacSummary;
    auditActivity: AuditActivitySummary;

    storeOrders: WorkloadSummary;
    deliveries: WorkloadSummary;
    productionPlans: WorkloadSummary;
    supportRequests: WorkloadSummary;

    dataFreshness: DataFreshness;
    notes: string[];
}
