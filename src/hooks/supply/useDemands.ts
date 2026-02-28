import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { demandApi } from '@/api/supply/demandApi';
import { CreateDemandPayload, DemandItemPayload } from '@/types/supply/demand.types';

export const useDemands = () => {
    return useQuery({
        queryKey: ['demands'],
        queryFn: demandApi.list,
    });
};

export const useDemandDetail = (id: number | null) => {
    return useQuery({
        queryKey: ['demands', id],
        queryFn: () => demandApi.detail(id!),
        enabled: !!id,
    });
};

export const useCreateDemand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDemandPayload) => demandApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demands'] });
        },
    });
};

export const useAddDemandItem = (demandId: number | null) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DemandItemPayload) => demandApi.addItem(demandId!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['demands', demandId] });
            queryClient.invalidateQueries({ queryKey: ['demands'] });
        },
    });
};
