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
  UpdateBatchCodePayload,
} from "@/types/kitchen/inventoryBatch.types";

export const kitchenInventoryKeys = {
  all: ["kitchenInventory"] as const,

  ingredientBatches: (
    centralKitchenId: number,
    params?: IngredientBatchListParams,
  ) =>
    [
      "kitchenInventory",
      "ingredientBatches",
      centralKitchenId,
      params,
    ] as const,

  productBatches: (
    centralKitchenId: number,
    params?: ProductBatchListParams,
  ) =>
    ["kitchenInventory", "productBatches", centralKitchenId, params] as const,

  ingredientBatchDetail: (centralKitchenId: number, batchId: number) =>
    [
      "kitchenInventory",
      "ingredientBatchDetail",
      centralKitchenId,
      batchId,
    ] as const,

  productBatchDetail: (centralKitchenId: number, batchId: number) =>
    [
      "kitchenInventory",
      "productBatchDetail",
      centralKitchenId,
      batchId,
    ] as const,

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

export const useIngredientBatchDetail = (
  centralKitchenId?: number,
  batchId?: number | null,
) => {
  return useQuery({
    queryKey: kitchenInventoryKeys.ingredientBatchDetail(
      Number(centralKitchenId),
      Number(batchId),
    ),
    queryFn: async () => {
      const res = await inventoryApi.getIngredientBatchDetail(
        Number(centralKitchenId),
        Number(batchId),
      );
      return res.data ?? null;
    },
    enabled: !!centralKitchenId && !!batchId,
  });
};

export const useProductBatchDetail = (
  centralKitchenId?: number,
  batchId?: number | null,
) => {
  return useQuery({
    queryKey: kitchenInventoryKeys.productBatchDetail(
      Number(centralKitchenId),
      Number(batchId),
    ),
    queryFn: async () => {
      const res = await inventoryApi.getProductBatchDetail(
        Number(centralKitchenId),
        Number(batchId),
      );
      return res.data ?? null;
    },
    enabled: !!centralKitchenId && !!batchId,
  });
};

export const useIngredients = () => {
  return useQuery({
    queryKey: kitchenInventoryKeys.ingredients,
    queryFn: async (): Promise<Ingredient[]> => {
      const res = await getIngredients({
        status: "ACTIVE",
        page: 1,
        pageSize: 200,
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
        pageSize: 200,
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
    hasError: query.isError,
    isEmpty: !query.isLoading && !query.isError && options.length === 0,
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
    hasError: query.isError,
    isEmpty: !query.isLoading && !query.isError && options.length === 0,
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
        queryKey: [
          "kitchenInventory",
          "ingredientBatches",
          variables.centralKitchenId,
        ],
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
        queryKey: [
          "kitchenInventory",
          "productBatches",
          variables.centralKitchenId,
        ],
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
        queryKey: [
          "kitchenInventory",
          "ingredientBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: kitchenInventoryKeys.ingredientBatchDetail(
          variables.centralKitchenId,
          payloadBatchIdFromVariables(variables.payload),
        ),
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
        queryKey: [
          "kitchenInventory",
          "productBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: kitchenInventoryKeys.productBatchDetail(
          variables.centralKitchenId,
          payloadBatchIdFromVariables(variables.payload),
        ),
      });
    },
  });
};

export const useRenameIngredientBatchCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      batchId,
      payload,
    }: {
      centralKitchenId: number;
      batchId: number;
      payload: UpdateBatchCodePayload;
    }) => inventoryApi.renameIngredientBatchCode(centralKitchenId, batchId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "kitchenInventory",
          "ingredientBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: kitchenInventoryKeys.ingredientBatchDetail(
          variables.centralKitchenId,
          variables.batchId,
        ),
      });
    },
  });
};

export const useRenameProductBatchCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      centralKitchenId,
      batchId,
      payload,
    }: {
      centralKitchenId: number;
      batchId: number;
      payload: UpdateBatchCodePayload;
    }) => inventoryApi.renameProductBatchCode(centralKitchenId, batchId, payload),

    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "kitchenInventory",
          "productBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: kitchenInventoryKeys.productBatchDetail(
          variables.centralKitchenId,
          variables.batchId,
        ),
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
        queryKey: [
          "kitchenInventory",
          "ingredientBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.removeQueries({
        queryKey: kitchenInventoryKeys.ingredientBatchDetail(
          variables.centralKitchenId,
          variables.batchId,
        ),
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
        queryKey: [
          "kitchenInventory",
          "productBatches",
          variables.centralKitchenId,
        ],
      });
      queryClient.removeQueries({
        queryKey: kitchenInventoryKeys.productBatchDetail(
          variables.centralKitchenId,
          variables.batchId,
        ),
      });
    },
  });
};

const payloadBatchIdFromVariables = (
  payload: AdjustIngredientBatchPayload | AdjustProductBatchPayload,
) => payload.batchId;