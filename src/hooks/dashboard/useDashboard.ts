import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/manager/dashboardApi';
import { DashboardOverviewParams } from '@/types/dashboard';

export const useDashboardOverview = (
    franchiseId?: number,
    params?: DashboardOverviewParams
) => {
    return useQuery({
        queryKey: ['dashboard-overview', franchiseId, params],
        queryFn: () => {
            // If franchiseId is explicitly provided (and valid number > 0), use the specific endpoint
            if (franchiseId && franchiseId > 0) {
                return dashboardApi.getFranchiseOverview(franchiseId, params);
            }
            // Otherwise use the general overview (admin all, manager assigned)
            return dashboardApi.getOverview(params);
        },
        // Keep raw data stale for 5 minutes instead of refetching constantly
        staleTime: 5 * 60 * 1000,
    });
};
