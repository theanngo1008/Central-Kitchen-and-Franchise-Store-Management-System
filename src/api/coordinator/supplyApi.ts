import { get, patch } from '../api';
import type {
    SupplyOrderListQuery,
    PrepareDeliveryRequest,
    UpdateSupplyDeliveryStatusRequest,
    SupplyOrderQueueItemResponse
} from '@/types/supply';

const ENDPOINT = '/supply/orders';

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
