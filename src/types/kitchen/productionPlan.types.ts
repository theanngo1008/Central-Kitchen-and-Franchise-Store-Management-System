export type ProductionPlanStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductionPlanItem {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
}

export interface ProductionPlanDetail {
  productionPlanId: number;
  centralKitchenId: number;
  planDate: string;
  status: ProductionPlanStatus;
  createdAt: string;
  items: ProductionPlanItem[];
}

export interface CreateProductionPlanPayload {
  planDate: string;
}

export interface UpdateProductionPlanStatusPayload {
  status: ProductionPlanStatus;
  reason: string;
}