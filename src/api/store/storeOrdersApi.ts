import adminApi from '../api';
import type { ApiResponse } from '@/types/common/apiResponse.types';
import type {
  StoreOrder,
  CreateStoreOrderPayload,
  UpdateStoreOrderPayload,
  CancelStoreOrderPayload,
  StoreOrderQuery,
} from '@/types/store/storeOrder.types';

export const storeOrdersApi = {
  list: async (franchiseId: number, params?: StoreOrderQuery) =>
    (await adminApi.get<ApiResponse<StoreOrder[]>>(
      `/franchises/${franchiseId}/store-orders`,
      { params }
    )).data,

  detail: async (franchiseId: number, orderId: number) =>
    (await adminApi.get<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders/${orderId}`
    )).data,

  create: async (franchiseId: number, payload: CreateStoreOrderPayload) =>
    (await adminApi.post<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders`,
      payload
    )).data,

  update: async (
    franchiseId: number,
    orderId: number,
    payload: UpdateStoreOrderPayload
  ) =>
    (await adminApi.put<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders/${orderId}`,
      payload
    )).data,

  submit: async (franchiseId: number, orderId: number) =>
    (await adminApi.post<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders/${orderId}/submit`
    )).data,

  lock: async (franchiseId: number, orderId: number) =>
    (await adminApi.post<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders/${orderId}/lock`
    )).data,

  cancel: async (
    franchiseId: number,
    orderId: number,
    payload: CancelStoreOrderPayload
  ) =>
    (await adminApi.post<ApiResponse<StoreOrder>>(
      `/franchises/${franchiseId}/store-orders/${orderId}/cancel`,
      payload
    )).data,
};