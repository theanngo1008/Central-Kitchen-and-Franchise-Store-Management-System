// src/types/product.ts

export type ProductStatus = "ACTIVE" | "INACTIVE";
export type ProductType = "FINISHED" | "SEMI_FINISHED";

export interface Product {
  id: number;
  name: string;
  sku: string;
  unit: string;
  status: ProductStatus;
  productType: ProductType;
  shelfLifeDays: number;
}

export interface ProductFormData {
  name: string;
  sku: string;
  unit: string;
  productType: ProductType;
  shelfLifeDays: number;
}

export interface ProductListParams {
  status?: ProductStatus | "ALL";
  productType?: ProductType;
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "sku" | "unit" | "status" | "productType" | "id";
  sortDir?: "asc" | "desc";
}

export interface ProductPaginatedData {
  items: Product[];
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

export type ProductListResponse = ApiResponse<ProductPaginatedData>;
export type ProductResponse = ApiResponse<Product>;