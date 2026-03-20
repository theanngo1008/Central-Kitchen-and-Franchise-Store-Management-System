import { useQuery } from '@tanstack/react-query';
import { getStoreInventorySummary } from '@/api/store/inventoryApi';

export const STORE_INVENTORY_SUMMARY_KEY = 'store-inventory-summary';

export function useStoreInventorySummary(franchiseId: number) {
    return useQuery({
        queryKey: [STORE_INVENTORY_SUMMARY_KEY, franchiseId],
        queryFn: () => getStoreInventorySummary(franchiseId),
        enabled: !!franchiseId,
    });
}
