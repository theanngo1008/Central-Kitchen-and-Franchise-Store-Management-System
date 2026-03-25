import { useQuery } from '@tanstack/react-query';
import { storeDashboardApi } from '@/api/store/dashboardApi';
import { StoreDashboardOverviewQuery } from '@/types/dashboard';

export const useStoreDashboardOverview = (
    params?: StoreDashboardOverviewQuery,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['store-dashboard-overview', params],
        queryFn: () => storeDashboardApi.getOverview(params),
        staleTime: 5 * 60 * 1000,
        enabled: options?.enabled !== false,
    });
};
