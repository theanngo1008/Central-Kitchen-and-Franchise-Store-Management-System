import { get, post } from '@/api';
import { unwrapResponse } from '@/api/unwrapResponse';
import type {
    ReceivingListItemResponse,
    ReceivingDetailResponse,
    ConfirmReceivingRequest,
    ReceivingConfirmResponse
} from '@/types/receiving';

const ENDPOINT = '/franchises';

export const getPendingReceivings = async (
    franchiseId: number
): Promise<ReceivingListItemResponse[]> => {
    const res = await get(`${ENDPOINT}/${franchiseId}/receivings/pending`);
    return unwrapResponse<ReceivingListItemResponse[]>(res);
};

export const getReceivingDetail = async (
    franchiseId: number,
    deliveryId: number
): Promise<ReceivingDetailResponse> => {
    const res = await get(`${ENDPOINT}/${franchiseId}/receivings/${deliveryId}`);
    return unwrapResponse<ReceivingDetailResponse>(res);
};

export const confirmReceiving = async (
    franchiseId: number,
    deliveryId: number,
    data: ConfirmReceivingRequest
): Promise<ReceivingConfirmResponse> => {
    const res = await post(`${ENDPOINT}/${franchiseId}/receivings/${deliveryId}/confirm`, data);
    return unwrapResponse<ReceivingConfirmResponse>(res);
};
