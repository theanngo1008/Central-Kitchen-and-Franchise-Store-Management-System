// src/types/kitchen/inventoryIssue.types.ts

export interface IssueIngredientsByProductionPlanPayload {
  reason?: string;
}

export interface IssuedIngredientBatch {
  batchId: number;
  batchCode: string;
  expiredAt?: string | null;
  issuedQuantity: number;
  movementId: number;
}

export interface IssuedIngredientLine {
  ingredientId: number;
  ingredientName: string;
  requiredQuantity: number;
  batches: IssuedIngredientBatch[];
}

export interface IssueIngredientsByProductionPlanResult {
  productionPlanId: number;
  centralKitchenId: number;
  planDate: string;
  issuedAt: string;
  lines: IssuedIngredientLine[];
}