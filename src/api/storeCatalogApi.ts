// Store Catalog API
// Endpoints: /api/store-catalog

import { get, post, put, patch, del } from './api';
import type {
    StoreCatalogListParams,
    StoreCatalogListResponse,
    StoreCatalogResponse,
    AssignProductData,
    UpdatePriceData,
    UpdateStatusData
} from '@/types/storeCatalog';



/**
 * GET /api/store-catalog
 * List catalog items for a franchise with filters, pagination, sorting
 */
export const getStoreCatalog = async (params: StoreCatalogListParams): Promise<StoreCatalogListResponse> => {
    const queryParams = new URLSearchParams();

    // Required
    queryParams.append('franchiseId', params.franchiseId.toString());

    // Optional filters
    if (params.status) queryParams.append('status', params.status);
    if (params.productType) queryParams.append('productType', params.productType);
    if (params.q) queryParams.append('q', params.q);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const query = queryParams.toString();
    return get<StoreCatalogListResponse>(`/franchises/${params.franchiseId}/catalog${query ? `?${query}` : ''}`);
};

/**
 * GET /api/store-catalog/{franchiseId}/{productId}
 * Get single catalog mapping by composite key
 */
export const getStoreCatalogItem = async (
    franchiseId: number,
    productId: number
): Promise<StoreCatalogResponse> => {
    return get<StoreCatalogResponse>(`/franchises/${franchiseId}/catalog/${productId}`);
};

/**
 * POST /api/store-catalog
 * Assign product to franchise catalog (upsert behavior)
 * - If not exists: create with ACTIVE status
 * - If exists: update price and reactivate if INACTIVE
 */
export const assignProduct = async (data: AssignProductData): Promise<StoreCatalogResponse> => {
    return post<StoreCatalogResponse>(`/franchises/${data.franchiseId}/catalog`, data);
};

/**
 * PUT /api/store-catalog/{franchiseId}/{productId}
 * Update price for existing catalog mapping
 */
export const updateCatalogPrice = async (
    franchiseId: number,
    productId: number,
    data: UpdatePriceData
): Promise<StoreCatalogResponse> => {
    return put<StoreCatalogResponse>(`/franchises/${franchiseId}/catalog/${productId}/price`, data);
};

/**
 * PATCH /api/store-catalog/{franchiseId}/{productId}/status
 * Activate/Deactivate catalog mapping
 */
export const updateCatalogStatus = async (
    franchiseId: number,
    productId: number,
    data: UpdateStatusData
): Promise<StoreCatalogResponse> => {
    return patch<StoreCatalogResponse>(`/franchises/${franchiseId}/catalog/${productId}/status`, data);
};

/**
 * DELETE /api/store-catalog/{franchiseId}/{productId}
 * Soft delete catalog mapping (sets status to INACTIVE)
 */
export const removeFromCatalog = async (
    franchiseId: number,
    productId: number
): Promise<void> => {
    return del<void>(`/franchises/${franchiseId}/catalog/${productId}`);
};