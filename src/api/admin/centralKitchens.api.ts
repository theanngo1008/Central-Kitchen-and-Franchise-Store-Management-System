import api from "../adminApi";
import type {
  AdminCentralKitchen,
  CreateCentralKitchenPayload,
  UpdateCentralKitchenPayload,
} from "@/types/admin/centralKitchen.types";

export const adminCentralKitchensApi = {
  list: async () =>
    (
      await api.get<{ data: AdminCentralKitchen[] }>(
        "/admin/central-kitchens",
      )
    ).data.data,

  detail: async (id: number) =>
    (
      await api.get<{ data: AdminCentralKitchen }>(
        `/admin/central-kitchens/${id}`,
      )
    ).data.data,

  create: async (payload: CreateCentralKitchenPayload) =>
    (
      await api.post<{ data: AdminCentralKitchen }>(
        "/admin/central-kitchens",
        payload,
      )
    ).data.data,

  update: async (id: number, payload: UpdateCentralKitchenPayload) => {
    await api.put(`/admin/central-kitchens/${id}`, payload);
  },

  remove: async (id: number) => {
    await api.delete(`/admin/central-kitchens/${id}`);
  },
};