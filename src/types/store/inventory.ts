export interface FranchiseInventoryBatchResponse {
  batchId: number;
  batchCode: string;
  expiredAt?: string; // YYYY-MM-DD
  quantity: number;
}

export interface FranchiseInventorySummaryItemResponse {
  itemType: "PRODUCT" | "INGREDIENT";
  itemId: number;
  itemName: string;
  unit: string;
  totalQuantity: number;
  lowStockThreshold?: number;
  isLowStock: boolean;
  batches: FranchiseInventoryBatchResponse[];
}

export interface FranchiseInventorySummaryResponse {
  items: FranchiseInventorySummaryItemResponse[];
}