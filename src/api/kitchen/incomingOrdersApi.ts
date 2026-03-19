import adminApi from "../api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type { StoreOrderQuery } from "@/types/store/storeOrder.types";
import type {
  IncomingOrder,
  IncomingOrderHistoryItem,
  IncomingOrderListData,
  ReceiveIncomingOrderPayload,
  ReceiveIncomingOrderResponse,
  UpdateProcessingNotePayload,
  UpdateProcessingNoteResponse,
  ForwardIncomingOrderPayload,
  ForwardIncomingOrderResponse,
} from "@/types/kitchen/incomingOrder.types";

export const incomingOrdersApi = {
  list: async (centralKitchenId: number, params?: StoreOrderQuery) =>
    (
      await adminApi.get<ApiResponse<IncomingOrderListData>>(
        `/central-kitchens/${centralKitchenId}/incoming-orders`,
        { params }
      )
    ).data,

  detail: async (centralKitchenId: number, orderId: number) =>
    (
      await adminApi.get<ApiResponse<IncomingOrder>>(
        `/central-kitchens/${centralKitchenId}/incoming-orders/${orderId}`
      )
    ).data,

  receive: async (
    centralKitchenId: number,
    orderId: number,
    payload?: ReceiveIncomingOrderPayload
  ) =>
    (
      await adminApi.patch<ReceiveIncomingOrderResponse>(
        `/central-kitchens/${centralKitchenId}/incoming-orders/${orderId}/receive`,
        payload ?? {}
      )
    ).data,

  updateProcessingNote: async (
    centralKitchenId: number,
    orderId: number,
    payload: UpdateProcessingNotePayload
  ) =>
    (
      await adminApi.patch<UpdateProcessingNoteResponse>(
        `/central-kitchens/${centralKitchenId}/incoming-orders/${orderId}/processing-note`,
        payload
      )
    ).data,

  forwardToSupply: async (
    centralKitchenId: number,
    orderId: number,
    payload?: ForwardIncomingOrderPayload
  ) =>
    (
      await adminApi.patch<ForwardIncomingOrderResponse>(
        `/central-kitchens/${centralKitchenId}/incoming-orders/${orderId}/forward-to-supply`,
        payload ?? {}
      )
    ).data,

  history: async (centralKitchenId: number, orderId: number) =>
    (
      await adminApi.get<IncomingOrderHistoryItem[]>(
        `/central-kitchens/${centralKitchenId}/incoming-orders/${orderId}/history`
      )
    ).data,
};