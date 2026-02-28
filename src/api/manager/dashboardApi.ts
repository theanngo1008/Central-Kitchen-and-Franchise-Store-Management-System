import api from '../api';
import { DashboardOverview, DashboardOverviewParams } from '@/types/dashboard';

export const dashboardApi = {
    getOverview: async (params?: DashboardOverviewParams): Promise<DashboardOverview> => {
        const response = await api.get<{ success: boolean; data: DashboardOverview }>('/manager/dashboard/overview', { params });
        return response.data.data;
    },

    getFranchiseOverview: async (franchiseId: number, params?: DashboardOverviewParams): Promise<DashboardOverview> => {
        const response = await api.get<{ success: boolean; data: DashboardOverview }>(`/manager/franchises/${franchiseId}/dashboard/overview`, { params });
        return response.data.data;
    },
};
