import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi, AdminDashboardQueryParams } from '@/api/admin/dashboardApi';

export const useAdminDashboardOverview = (params?: AdminDashboardQueryParams) => {
    return useQuery({
        queryKey: ['adminDashboard', 'overview', params],
        queryFn: () => adminDashboardApi.getOverview(params),
        staleTime: 5 * 60 * 1000, // Conceptually 5 minutes stale time
        retry: 2,
    });
};
