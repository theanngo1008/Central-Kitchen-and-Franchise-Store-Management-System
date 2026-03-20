// Ingredient Master Types

export type IngredientStatus = 'ACTIVE' | 'INACTIVE';

export interface Ingredient {
    id: string | number;
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
    status?: IngredientStatus | '';
    sortBy?: keyof Ingredient;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

// Paginated response from backend
export interface IngredientPaginatedData {
    items: Ingredient[];
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
export type IngredientListResponse = ApiResponse<IngredientPaginatedData>;

// Single ingredient response
export type IngredientResponse = ApiResponse<Ingredient>;
