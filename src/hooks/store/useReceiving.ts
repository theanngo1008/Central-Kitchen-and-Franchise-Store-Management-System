import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
    getPendingReceivings,
    getReceivingDetail,
    confirmReceiving
} from '@/api/store/receivingApi';
import type { ConfirmReceivingRequest } from '@/types/receiving';

export const PENDING_RECEIVINGS_KEY = 'pending-receivings';
export const RECEIVING_DETAIL_KEY = 'receiving-detail';

export function usePendingReceivings(franchiseId: number) {
    return useQuery({
        queryKey: [PENDING_RECEIVINGS_KEY, franchiseId],
        queryFn: () => getPendingReceivings(franchiseId),
        enabled: !!franchiseId,
    });
}

export function useReceivingDetail(franchiseId: number, deliveryId: number | null) {
    return useQuery({
        queryKey: [RECEIVING_DETAIL_KEY, franchiseId, deliveryId],
        queryFn: () => getReceivingDetail(franchiseId, deliveryId!),
        enabled: !!franchiseId && !!deliveryId,
    });
}

export function useConfirmReceiving() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            franchiseId,
            deliveryId,
            data
        }: {
            franchiseId: number;
            deliveryId: number;
            data: ConfirmReceivingRequest;
        }) => confirmReceiving(franchiseId, deliveryId, data),
        onSuccess: (res, variables) => {
            toast.success('Xác nhận nhận hàng thành công!');
            // Invalidate lists to fetch new data
            queryClient.invalidateQueries({ queryKey: [PENDING_RECEIVINGS_KEY, variables.franchiseId] });
            queryClient.invalidateQueries({ queryKey: [RECEIVING_DETAIL_KEY, variables.franchiseId, variables.deliveryId] });
            // Also invalidate inventory summary if it exists
            queryClient.invalidateQueries({ queryKey: ['store-inventory-summary', variables.franchiseId] });
        },
        onError: (error: AxiosError | Error) => {
            const err = error as any;
            toast.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi nhận hàng');
        }
    });
}
