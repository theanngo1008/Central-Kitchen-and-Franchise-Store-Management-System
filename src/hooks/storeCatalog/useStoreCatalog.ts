// Store Catalog React Query Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getStoreCatalog,
    getStoreCatalogItem,
    assignProduct,
    updateCatalogPrice,
    updateCatalogStatus,
    removeFromCatalog
} from '@/api/storeCatalogApi';
import type {
    StoreCatalogListParams,
    AssignProductData,
    UpdatePriceData,
    UpdateStatusData
} from '@/types/storeCatalog';
import { toast } from 'sonner';

const STORE_CATALOG_KEY = 'store-catalog';

// Hook to get catalog list for a franchise
export const useStoreCatalog = (params: StoreCatalogListParams) => {
    return useQuery({
        queryKey: [STORE_CATALOG_KEY, params],
        queryFn: () => getStoreCatalog(params),
        enabled: !!params.franchiseId,
    });
};

// Hook to get single catalog item
export const useStoreCatalogItem = (franchiseId: number, productId: number) => {
    return useQuery({
        queryKey: [STORE_CATALOG_KEY, franchiseId, productId],
        queryFn: () => getStoreCatalogItem(franchiseId, productId),
        enabled: !!franchiseId && !!productId,
    });
};

// Hook to assign product to catalog (upsert)
export const useAssignProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AssignProductData) => assignProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_CATALOG_KEY] });
            toast.success('Đã thêm sản phẩm vào danh mục');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể thêm sản phẩm vào danh mục');
        },
    });
};

// Hook to update price
export const useUpdateCatalogPrice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ franchiseId, productId, data }: {
            franchiseId: number;
            productId: number;
            data: UpdatePriceData
        }) => updateCatalogPrice(franchiseId, productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_CATALOG_KEY] });
            toast.success('Đã cập nhật giá');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể cập nhật giá');
        },
    });
};

// Hook to update status (activate/deactivate)
export const useUpdateCatalogStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ franchiseId, productId, data }: {
            franchiseId: number;
            productId: number;
            data: UpdateStatusData
        }) => updateCatalogStatus(franchiseId, productId, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [STORE_CATALOG_KEY] });
            const statusText = response.data?.status === 'ACTIVE' ? 'kích hoạt' : 'ngưng bán';
            toast.success(`Đã ${statusText} sản phẩm`);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể thay đổi trạng thái');
        },
    });
};

// Hook to remove from catalog (soft delete)
export const useRemoveFromCatalog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ franchiseId, productId }: { franchiseId: number; productId: number }) =>
            removeFromCatalog(franchiseId, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_CATALOG_KEY] });
            toast.success('Đã xóa sản phẩm khỏi danh mục');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Không thể xóa sản phẩm');
        },
    });
};