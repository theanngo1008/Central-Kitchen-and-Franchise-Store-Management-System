import { useQuery } from '@tanstack/react-query';
import { kitchenDashboardApi } from '@/api/kitchen/dashboardApi';
import { KitchenDashboardOverviewQuery } from '@/types/dashboard';

export const useKitchenDashboardOverview = (
    params?: KitchenDashboardOverviewQuery,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['kitchen-dashboard-overview', params],
        queryFn: () => kitchenDashboardApi.getOverview(params),
        staleTime: 5 * 60 * 1000,
        enabled: options?.enabled !== false,
    });
};
