// Product Types

export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ProductType = 'FINISHED' | 'SEMI_FINISHED';

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
    status?: ProductStatus | 'ALL';
    productType?: ProductType;
    q?: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'name' | 'sku' | 'unit' | 'status' | 'productType' | 'id';
    sortDir?: 'asc' | 'desc';
}

// Paginated response from backend
export interface ProductPaginatedData {
    items: Product[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// Full API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    errorCode: string | null;
    data: T;
    errors: string[] | null;
    fieldErrors: Record<string, string[]> | null;
}

// API list response
export type ProductListResponse = ApiResponse<ProductPaginatedData>;

// Single product response
export type ProductResponse = ApiResponse<Product>;
