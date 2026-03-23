export type KitchenInventoryTab = "INGREDIENT" | "PRODUCT";

export type InventoryAdjustmentType = "ADJUST" | "WASTE";

export interface IngredientBatch {
  batchId: number;
  centralKitchenId: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  batchCode: string;
  quantity: number;
  createdAt: string;
  expiredAt: string;
}

export interface ProductBatch {
  batchId: number;
  centralKitchenId: number;
  productId: number;
  productName: string;
  unit: string;
  batchCode: string;
  quantity: number;
  createdAt: string;
  expiredAt: string;
}

export interface IngredientBatchListParams {
  ingredientId?: number;
  includeZero?: boolean;
}

export interface ProductBatchListParams {
  productId?: number;
  includeZero?: boolean;
}

export interface CreateIngredientInboundPayload {
  ingredientId: number;
  batchCode: string;
  quantity: number;
  createdAtUtc: string;
  reason?: string;
}

export interface CreateProductInboundPayload {
  productId: number;
  batchCode: string;
  quantity: number;
  createdAtUtc: string;
  reason?: string;
}

export interface AdjustIngredientBatchPayload {
  batchId: number;
  type: InventoryAdjustmentType;
  deltaQuantity: number;
  reason: string;
  reference?: string;
}

export interface AdjustProductBatchPayload {
  batchId: number;
  type: InventoryAdjustmentType;
  deltaQuantity: number;
  reason: string;
  reference?: string;
}

export interface UpdateBatchCodePayload {
  batchCode: string;
  reason?: string;
}

export interface IngredientAdjustmentResult {
  batchId: number;
  movementId: number;
  centralKitchenId: number;
  ingredientId: number;
  batchCode: string;
  expiredAt: string;
  beforeQuantity: number;
  deltaQuantity: number;
  afterQuantity: number;
  type: string;
  reason: string;
  createdAt: string;
}

export interface ProductAdjustmentResult {
  batchId: number;
  movementId: number;
  centralKitchenId: number;
  productId: number;
  batchCode: string;
  expiredAt: string;
  beforeQuantity: number;
  deltaQuantity: number;
  afterQuantity: number;
  type: string;
  reason: string;
  createdAt: string;
}