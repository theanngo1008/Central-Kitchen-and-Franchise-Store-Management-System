import { get } from '@/api';
import { unwrapResponse } from '@/api/unwrapResponse';
import type { FranchiseInventorySummaryResponse } from '@/types/inventory';

const ENDPOINT = '/franchises';

export const getStoreInventorySummary = async (
    franchiseId: number
): Promise<FranchiseInventorySummaryResponse> => {
    const res = await get(`${ENDPOINT}/${franchiseId}/inventory/summary`);
    return unwrapResponse<FranchiseInventorySummaryResponse>(res);
};
