import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
    getSupplyQueue,
    prepareDelivery,
    updateDeliveryStatus
} from '@/api/coordinator/supplyApi';
import type {
    SupplyOrderListQuery,
    PrepareDeliveryRequest,
    UpdateSupplyDeliveryStatusRequest
} from '@/types/supply';

export const SUPPLY_QUEUE_KEY = 'supply-queue';

export function useSupplyQueue(params?: SupplyOrderListQuery) {
    return useQuery({
        queryKey: [SUPPLY_QUEUE_KEY, params],
        queryFn: () => getSupplyQueue(params),
        placeholderData: keepPreviousData,
    });
}

export function usePrepareDelivery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: PrepareDeliveryRequest }) =>
            prepareDelivery(orderId, data),
        onSuccess: () => {
            toast.success('Đã chuẩn bị giao hàng thành công');
            queryClient.invalidateQueries({ queryKey: [SUPPLY_QUEUE_KEY] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || 'Không thể chuẩn bị giao hàng');
        }
    });
}

export function useUpdateDeliveryStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: UpdateSupplyDeliveryStatusRequest }) =>
            updateDeliveryStatus(orderId, data),
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái đơn hàng thành công');
            queryClient.invalidateQueries({ queryKey: [SUPPLY_QUEUE_KEY] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
        }
    });
}
