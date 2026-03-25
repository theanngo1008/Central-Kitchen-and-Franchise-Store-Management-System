import api from '../api';
import { 
    SupplyDashboardOverviewResponse, 
    SupplyDashboardOverviewQuery 
} from '@/types/dashboard';

export const supplyDashboardApi = {
    getOverview: async (params?: SupplyDashboardOverviewQuery): Promise<SupplyDashboardOverviewResponse> => {
        const response = await api.get<{ success: boolean; data: SupplyDashboardOverviewResponse }>('/supply/dashboard/overview', { params });
        return response.data.data;
    },
};
