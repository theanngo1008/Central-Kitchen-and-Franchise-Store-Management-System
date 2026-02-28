import api from '../api';
import type { AdminDashboardOverview } from '@/types/adminDashboard';

export interface AdminDashboardQueryParams {
    fromDate?: string;
    toDate?: string;
    timezoneOffsetMinutes?: number;
    top?: number;
}

export const adminDashboardApi = {
    getOverview: async (params?: AdminDashboardQueryParams) => {
        const defaultParams = {
            ...params,
            timezoneOffsetMinutes: params?.timezoneOffsetMinutes ?? (new Date().getTimezoneOffset() * -1),
        };

        // As observed in franchises config, api.get returns AxiosResponse mapping to ApiResponse<T> where T sits inside data
        // Hence we extract .data.data
        const response = await api.get<{ data: AdminDashboardOverview }>('/admin/dashboard/overview', { params: defaultParams });
        return response.data.data;
    }
};
