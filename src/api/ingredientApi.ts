import { get, post, put, patch } from "./api";
import type {
  IngredientFormData,
  IngredientListParams,
  IngredientListResponse,
  IngredientResponse,
} from "@/types/ingredient";

const ENDPOINT = "/ingredients";
const ADMIN_ENDPOINT = "/admin/ingredients";

export const getIngredients = async (
  params?: IngredientListParams,
): Promise<IngredientListResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());

  const query = queryParams.toString();
  return get<IngredientListResponse>(`${ENDPOINT}${query ? `?${query}` : ""}`);
};

export const getIngredientById = async (
  id: number,
): Promise<IngredientResponse> => {
  return get<IngredientResponse>(`${ENDPOINT}/${id}`);
};

export const createIngredient = async (
  data: IngredientFormData,
): Promise<number> => {
  return post<number>(ADMIN_ENDPOINT, data);
};

export const updateIngredient = async (
  id: number,
  data: IngredientFormData,
): Promise<void> => {
  return put<void>(`${ADMIN_ENDPOINT}/${id}`, data);
};

export const toggleIngredientStatus = async (
  id: number,
  status: string,
): Promise<void> => {
  return patch<void>(`${ADMIN_ENDPOINT}/${id}/status`, { status });
};