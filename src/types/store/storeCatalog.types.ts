export type CatalogStatus = 'ACTIVE' | 'INACTIVE';

export interface StoreCatalogItem {
  franchiseId: number;
  franchiseName: string;

  productId: number;
  productName: string;
  sku: string;

  unit: string;
  productType: string;

  price: number;
  status: CatalogStatus;

  createdAt: string;
  updatedAt: string;
}

export interface StoreCatalogQuery {
  status?: string;
  q?: string;
  productType?: string;

  minPrice?: number;
  maxPrice?: number;

  page?: number;
  pageSize?: number;

  sortBy?: string;
  sortDir?: string;
}

export interface CreateCatalogItemPayload {
  productId: number;
  price: number;
}

export interface UpdateCatalogPricePayload {
  price: number;
}

export interface UpdateCatalogStatusPayload {
  status: string;
  reason?: string;
}