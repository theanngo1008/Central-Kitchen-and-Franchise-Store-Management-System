import { useQuery } from '@tanstack/react-query';
import { storeCatalogApi } from '@/api/store/storeCatalogApi';

export const useStoreCatalog = (franchiseId: number) => {
  return useQuery({
    queryKey: ['storeCatalog', franchiseId],
    queryFn: () => storeCatalogApi.list(franchiseId),
    enabled: !!franchiseId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};