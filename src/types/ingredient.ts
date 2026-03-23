// src/types/ingredient.ts

export type IngredientStatus = "ACTIVE" | "INACTIVE";

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  safetyStock: number;
  wasteThreshold: number;
  status: IngredientStatus;
  createdAt?: string;
  updatedAt: string;
}

export interface IngredientFormData {
  name: string;
  unit: string;
  supplierId: number | null;
  shelfLifeDays: number;
  price: number;
  safetyStock: number;
  wasteThreshold: number;
}

export interface IngredientListParams {
  search?: string;
  status?: IngredientStatus | "";
  sortBy?: keyof Ingredient;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface IngredientPaginatedData {
  items: Ingredient[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  errorCode: string | null;
  data: T;
  errors: string[] | null;
  fieldErrors: Record<string, string[]> | null;
}

export type IngredientListResponse = ApiResponse<IngredientPaginatedData>;
export type IngredientResponse = ApiResponse<Ingredient>;