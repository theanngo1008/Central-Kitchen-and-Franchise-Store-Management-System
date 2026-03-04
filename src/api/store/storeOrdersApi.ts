import adminApi from '../api';
import type {
  StoreOrder,
  CreateStoreOrderPayload,
  UpdateStoreOrderPayload,
  CancelStoreOrderPayload,
  StoreOrderQuery,
} from '@/types/store/storeOrder.types';

export const storeOrdersApi = {
  list: async (franchiseId: number, params?: StoreOrderQuery) =>
    (await adminApi.get<StoreOrder[]>(
      `/api/franchises/${franchiseId}/store-orders`,
      { params }
    )).data,

  detail: async (franchiseId: number, orderId: number) =>
    (await adminApi.get<StoreOrder>(
      `/api/franchises/${franchiseId}/store-orders/${orderId}`
    )).data,

  create: async (franchiseId: number, payload: CreateStoreOrderPayload) =>
    (await adminApi.post<StoreOrder>(
      `/api/franchises/${franchiseId}/store-orders`,
      payload
    )).data,

  update: async (
    franchiseId: number,
    orderId: number,
    payload: UpdateStoreOrderPayload
  ) =>
    (await adminApi.put<StoreOrder>(
      `/api/franchises/${franchiseId}/store-orders/${orderId}`,
      payload
    )).data,

  submit: async (franchiseId: number, orderId: number) =>
    (await adminApi.post(
      `/api/franchises/${franchiseId}/store-orders/${orderId}/submit`
    )).data,

  lock: async (franchiseId: number, orderId: number) =>
    (await adminApi.post(
      `/api/franchises/${franchiseId}/store-orders/${orderId}/lock`
    )).data,

  cancel: async (
    franchiseId: number,
    orderId: number,
    payload: CancelStoreOrderPayload
  ) =>
    (await adminApi.post(
      `/api/franchises/${franchiseId}/store-orders/${orderId}/cancel`,
      payload
    )).data,
};