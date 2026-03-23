import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventoryApi } from "@/api/kitchen/inventoryApi";
import { getIngredients } from "@/api/ingredientApi";
import { getProducts } from "@/api/productApi";

import type { Ingredient } from "@/types/ingredient";
import type { Product } from "@/types/product";
import type {
  AdjustIngredientBatchPayload,
  AdjustProductBatchPayload,
  CreateIngredientInboundPayload,
  CreateProductInboundPayload,
  IngredientBatchListParams,
  ProductBatchListParams,
} from "@/types/kitchen/inventoryBatch.types";

export const kitchenInventoryKeys = {
  all: ["kitchenInventory"] as const,

  ingredientBatches: (
    centralKitchenId: number,
    params?: IngredientBatchListParams,
  ) => ["kitchenInventory", "ingredientBatches", centralKitchenId, params] as const,

  productBatches: (
    centralKitchenId: number,
    params?: ProductBatchListParams,
  ) => ["kitchenInventory", "productBatches", centralKitchenId, params] as const,

  ingredients: ["kitchenInventory", "ingredients"] as const,
  products: ["kitchenInventory", "products"] as const,
};

export const useIngredientBatches = (
  centralKitchenId?: number,
  params?: IngredientBatchListParams,
) => {
  return useQuery({
    queryKey: kitchenInventoryKeys.ingredientBatches(
      Number(centralKitchenId),
      params,
    ),
    queryFn: async () => {
      const res = await inventoryApi.getIngredientBatches(
        Number(centralKitchenId),
        params,
      );
      return res.data ?? [];
    },
    enabled: !!centralKitchenId,
  });
};

export const useProductBatches = (
  centralKitchenId?: number,
  params?: ProductBatchListParams,
) => {
  return useQuery({
    queryKey: kitchenInventoryKeys.productBatches(
      Number(centralKitchenId),
      params,
    ),
    queryFn: async () => {
      const res = await inventoryApi.getProductBatches(
        Number(centralKitchenId),
        params,
      );
      return res.data ?? [];
    },
    enabled: !!centralKitchenId,
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: kitchenInventoryKeys.ingredients,
    queryFn: async (): Promise<Ingredient[]> => {
      const res = await getIngredients({
        status: "ACTIVE",
        page: 1,
        pageSize: 1000,
      });

      return res.data?.items ?? [];
    },
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: kitchenInventoryKeys.products,
    queryFn: async (): Promise<Product[]> => {
      const res = await getProducts({
        status: "ACTIVE",
        page: 1,
        pageSize: 1000,
      });

      return res.data?.items ?? [];
    },
  });
};

export const useIngredientOptions = () => {
  const query = useIngredients();

  const options = useMemo(
    () =>
      (query.data ?? []).map((item) => ({
        value: Number(item.id),
        label: `${item.name} (${item.unit})`,
        raw: item,
      })),
    [query.data],
  );

  return {
    ...query,
    options,
  };
};

export const useProductOptions = () => {
  const query = useProducts();

  const options = useMemo(
    () =>
      (query.data ?? []).map((item) => ({
        value: item.id,
        label: `${item.name} (${item.unit})`,
        raw: item,
      })),
    [query.data],
  );

  return {
    ...query,
    options,
  };
};

export const useCreateIngredientInboundBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      payload,
    }: {
      centralKitchenId: number;
      payload: CreateIngredientInboundPayload;
    }) => inventoryApi.createIngredientInboundBatch(centralKitchenId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "ingredientBatches", variables.centralKitchenId],
      });
    },
  });
};

export const useCreateProductInboundBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      payload,
    }: {
      centralKitchenId: number;
      payload: CreateProductInboundPayload;
    }) => inventoryApi.createProductInboundBatch(centralKitchenId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "productBatches", variables.centralKitchenId],
      });
    },
  });
};

export const useAdjustIngredientBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      payload,
    }: {
      centralKitchenId: number;
      payload: AdjustIngredientBatchPayload;
    }) => inventoryApi.adjustIngredientBatch(centralKitchenId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "ingredientBatches", variables.centralKitchenId],
      });
    },
  });
};

export const useAdjustProductBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      payload,
    }: {
      centralKitchenId: number;
      payload: AdjustProductBatchPayload;
    }) => inventoryApi.adjustProductBatch(centralKitchenId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "productBatches", variables.centralKitchenId],
      });
    },
  });
};

export const useDeleteIngredientBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      batchId,
    }: {
      centralKitchenId: number;
      batchId: number;
    }) => inventoryApi.deleteIngredientBatch(centralKitchenId, batchId),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "ingredientBatches", variables.centralKitchenId],
      });
    },
  });
};

export const useDeleteProductBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      batchId,
    }: {
      centralKitchenId: number;
      batchId: number;
    }) => inventoryApi.deleteProductBatch(centralKitchenId, batchId),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenInventory", "productBatches", variables.centralKitchenId],
      });
    },
  });
};