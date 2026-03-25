import api from '../api';
import { 
    KitchenDashboardOverviewResponse, 
    KitchenDashboardOverviewQuery 
} from '@/types/dashboard';

export const kitchenDashboardApi = {
    getOverview: async (params?: KitchenDashboardOverviewQuery): Promise<KitchenDashboardOverviewResponse> => {
        const response = await api.get<{ success: boolean; data: KitchenDashboardOverviewResponse }>('/kitchen/dashboard/overview', { params });
        return response.data.data;
    },
};
