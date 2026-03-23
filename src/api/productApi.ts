// src/api/productApi.ts

import { get, post, put, patch } from "./api";
import type {
  ProductListParams,
  ProductListResponse,
  ProductResponse,
  ProductFormData,
} from "@/types/product";

const ENDPOINT = "/products";
const ADMIN_ENDPOINT = "/admin/products";

/**
 * GET /api/products
 * List/search products with filters, pagination, sorting
 */
export const getProducts = async (
  params?: ProductListParams,
): Promise<ProductListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.productType) queryParams.append("productType", params.productType);
  if (params?.q) queryParams.append("q", params.q);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortDir) queryParams.append("sortDir", params.sortDir);

  const query = queryParams.toString();
  return get<ProductListResponse>(`${ENDPOINT}${query ? `?${query}` : ""}`);
};

/**
 * GET /api/products/{id}
 * Get single product by ID
 */
export const getProductById = async (id: number): Promise<ProductResponse> => {
  return get<ProductResponse>(`${ENDPOINT}/${id}`);
};

/**
 * POST /api/admin/products
 * Create product
 */
export const createProduct = async (data: ProductFormData): Promise<number> => {
  return post<number>(ADMIN_ENDPOINT, data);
};

/**
 * PUT /api/admin/products/{id}
 * Update product
 */
export const updateProduct = async (
  id: number,
  data: ProductFormData,
): Promise<void> => {
  return put<void>(`${ADMIN_ENDPOINT}/${id}`, data);
};

/**
 * PATCH /api/admin/products/{id}/status
 * Toggle product status
 */
export const toggleProductStatus = async (
  id: number,
  status: string,
): Promise<void> => {
  return patch<void>(`${ADMIN_ENDPOINT}/${id}/status`, { status });
};