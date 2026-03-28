// src/types/reports.ts

// ─── Query Params ─────────────────────────────────────────────
export interface InventoryReportQuery {
  fromDate: string;   // YYYY-MM-DD
  toDate: string;     // YYYY-MM-DD
  franchiseId?: number | null;
  centralKitchenId?: number | null;
  timezoneOffsetMinutes?: number;
}

export interface WastageReportQuery {
  fromDate: string;
  toDate: string;
  franchiseId?: number | null;
  centralKitchenId?: number | null;
  sortBy?: "lostValue" | "wastedQuantity" | "wasteRate";
  timezoneOffsetMinutes?: number;
}

export interface StorePerformanceReportQuery {
  fromDate: string;
  toDate: string;
  timezoneOffsetMinutes?: number;
}

export interface StoreMonthlyExportQuery {
  year: number;
  month: number;
  franchiseId: number;
  timezoneOffsetMinutes?: number;
}

export interface KitchenMonthlyExportQuery {
  year: number;
  month: number;
  centralKitchenId?: number | null;
  timezoneOffsetMinutes?: number;
}

// ─── Response Types ────────────────────────────────────────────
export interface InventoryReportItemResponse {
  itemId: number;
  itemName: string;
  unit: string;
  itemType: "INGREDIENT" | "PRODUCT" | string;
  openingQuantity: number;
  inboundQuantity: number;
  outboundQuantity: number;
  wastedQuantity: number;
  adjustmentQuantity: number;
  closingQuantity: number;
  closingValue: number;
}

export interface InventoryReportResponse {
  fromDate: string;
  toDate: string;
  timezoneOffsetMinutes: number;
  scopeType: string;
  franchiseId?: number | null;
  franchiseName?: string | null;
  centralKitchenId?: number | null;
  centralKitchenName?: string | null;
  notes: string[];
  items: InventoryReportItemResponse[];
}

export interface WastageReportItemResponse {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  wasteReason: string;
  wastedQuantity: number;
  wasteRate?: number | null;
  totalLostValue: number;
}

export interface WastageReportResponse {
  fromDate: string;
  toDate: string;
  timezoneOffsetMinutes: number;
  scopeType: string;
  franchiseId?: number | null;
  franchiseName?: string | null;
  centralKitchenId?: number | null;
  centralKitchenName?: string | null;
  sortBy: string;
  notes: string[];
  items: WastageReportItemResponse[];
}

export interface StorePerformanceReportItemResponse {
  franchiseId: number;
  franchiseName: string;
  totalOrderCount: number;
  totalIngredientSpending: number;
  totalProductSpending: number;
  totalSpending: number;
  totalDeliveredOrders: number;
  onTimeDeliveredOrders: number;
  onTimeRate?: number | null;
}

export interface StorePerformanceReportResponse {
  fromDate: string;
  toDate: string;
  timezoneOffsetMinutes: number;
  notes: string[];
  items: StorePerformanceReportItemResponse[];
}
