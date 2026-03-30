import { get, patch } from '../api';
import type {
    SupplyOrderListQuery,
    PrepareDeliveryRequest,
    UpdateSupplyDeliveryStatusRequest,
    SupplyOrderQueueItemResponse,
    UpdateDeliveryItemRequest,
    DeliveryDetailResponse
} from '@/types/supply';

const ENDPOINT = '/supply/orders';
const DELIVERIES_ENDPOINT = '/deliveries';

export const getSupplyQueue = async (
    params?: SupplyOrderListQuery
): Promise<SupplyOrderQueueItemResponse[]> => {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.franchiseId) queryParams.append('franchiseId', params.franchiseId.toString());
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    const query = queryParams.toString();
    return get<SupplyOrderQueueItemResponse[]>(`${ENDPOINT}${query ? `?${query}` : ''}`);
};

export const prepareDelivery = async (
    orderId: number,
    data: PrepareDeliveryRequest
): Promise<SupplyOrderQueueItemResponse> => {
    return patch<SupplyOrderQueueItemResponse>(`${ENDPOINT}/${orderId}/prepare-delivery`, data);
};

export const updateDeliveryStatus = async (
    orderId: number,
    data: UpdateSupplyDeliveryStatusRequest
): Promise<SupplyOrderQueueItemResponse> => {
    return patch<SupplyOrderQueueItemResponse>(`${ENDPOINT}/${orderId}/delivery-status`, data);
};

export const updateDeliveryProductItem = async (
    deliveryId: number,
    productId: number,
    data: UpdateDeliveryItemRequest
): Promise<void> => {
    return patch<void>(`${DELIVERIES_ENDPOINT}/${deliveryId}/product-items/${productId}`, data);
};

export const updateDeliveryIngredientItem = async (
    deliveryId: number,
    ingredientId: number,
    data: UpdateDeliveryItemRequest
): Promise<void> => {
    return patch<void>(`${DELIVERIES_ENDPOINT}/${deliveryId}/ingredient-items/${ingredientId}`, data);
};

export const getDeliveryDetail = async (
    deliveryId: number
): Promise<DeliveryDetailResponse> => {
    return get<DeliveryDetailResponse>(`${DELIVERIES_ENDPOINT}/${deliveryId}`);
};
