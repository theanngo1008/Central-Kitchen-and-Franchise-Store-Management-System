import api from '../api';
import type {
    DemandAggregation,
    CreateDemandPayload,
    DemandItemPayload
} from '@/types/supply/demand.types';

export const demandApi = {
    // Get all demands (Currently MVP returns array directly)
    list: async () =>
        (await api.get<DemandAggregation[]>('/supply/demands')).data,

    // Get demand detail with nested items
    detail: async (id: number) =>
        (await api.get<DemandAggregation>(`/supply/demands/${id}`)).data,

    // Create new demand aggregation
    create: async (payload: CreateDemandPayload) =>
        (await api.post<number>('/supply/demands', payload)).data,

    // Add item to demand
    addItem: async (demandId: number, payload: DemandItemPayload) =>
        (await api.post(`/supply/demands/${demandId}/items`, payload)).data,
};
