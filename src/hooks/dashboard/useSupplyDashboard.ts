import { useQuery } from '@tanstack/react-query';
import { supplyDashboardApi } from '@/api/coordinator/dashboardApi';
import { SupplyDashboardOverviewQuery } from '@/types/dashboard';

export const useSupplyDashboardOverview = (
    params?: SupplyDashboardOverviewQuery,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['supply-dashboard-overview', params],
        queryFn: () => supplyDashboardApi.getOverview(params),
        staleTime: 5 * 60 * 1000,
        enabled: options?.enabled !== false,
    });
};
