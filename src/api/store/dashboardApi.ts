import api from '../api';
import { 
    StoreDashboardOverviewResponse, 
    StoreDashboardOverviewQuery 
} from '@/types/dashboard';

export const storeDashboardApi = {
    getOverview: async (params?: StoreDashboardOverviewQuery): Promise<StoreDashboardOverviewResponse> => {
        const response = await api.get<{ success: boolean; data: StoreDashboardOverviewResponse }>('/store/dashboard/overview', { params });
        return response.data.data;
    },
};
