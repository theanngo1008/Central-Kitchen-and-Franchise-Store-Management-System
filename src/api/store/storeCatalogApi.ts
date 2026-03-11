import api from "../api";
import type {
  StoreCatalogItem,
  CreateCatalogItemPayload,
  UpdateCatalogPricePayload,
  UpdateCatalogStatusPayload,
} from "@/types/store/storeCatalog.types";

export const storeCatalogApi = {
  list: async (franchiseId: number, params?: Record<string, any>) =>
    (await api.get(`/franchises/${franchiseId}/catalog`, { params })).data,

  create: async (franchiseId: number, payload: CreateCatalogItemPayload) =>
    (await api.post(`/franchises/${franchiseId}/catalog`, payload)).data,

  updatePrice: async (franchiseId: number, productId: number, payload: UpdateCatalogPricePayload) =>
    (await api.put(`/franchises/${franchiseId}/catalog/${productId}/price`, payload)).data,

  updateStatus: async (franchiseId: number, productId: number, payload: UpdateCatalogStatusPayload) =>
    (await api.patch(`/franchises/${franchiseId}/catalog/${productId}/status`, payload)).data,

  remove: async (franchiseId: number, productId: number) =>
    (await api.delete(`/franchises/${franchiseId}/catalog/${productId}`)).data,
};