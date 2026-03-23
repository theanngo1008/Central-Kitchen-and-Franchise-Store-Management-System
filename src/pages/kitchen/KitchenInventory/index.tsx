import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { authApi } from "@/api";

import type {
  IngredientBatch,
  ProductBatch,
  KitchenInventoryTab,
} from "@/types/kitchen/inventoryBatch.types";

import {
  useAdjustIngredientBatch,
  useAdjustProductBatch,
  useCreateIngredientInboundBatch,
  useCreateProductInboundBatch,
  useDeleteIngredientBatch,
  useDeleteProductBatch,
  useIngredientBatches,
  useIngredientOptions,
  useProductBatches,
  useProductOptions,
} from "@/hooks/kitchen/useKitchenInventory";

import {
  filterInventoryBatches,
  getInventorySummary,
} from "./helpers";

import InventoryToolbar from "./components/InventoryToolbar";
import InventoryTabs from "./components/InventoryTabs";
import InventorySummaryCards from "./components/InventorySummaryCards";
import InventoryBatchTable from "./components/InventoryBatchTable";
import EmptyInventoryState from "./components/EmptyInventoryState";
import CreateInboundBatchModal from "./components/CreateInboundBatchModal";
import AdjustBatchModal from "./components/AdjustBatchModal";
import DeleteBatchConfirmDialog from "./components/DeleteBatchConfirmDialog";

type BatchRow = IngredientBatch | ProductBatch;

const KitchenInventory: React.FC = () => {
  const user = authApi.getCurrentUser();
  const centralKitchenId = user?.centralKitchenId
    ? Number(user.centralKitchenId)
    : undefined;

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<KitchenInventoryTab>("INGREDIENT");

  const [createOpen, setCreateOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState<BatchRow | null>(null);

  const ingredientBatchesQuery = useIngredientBatches(centralKitchenId, {
    includeZero: false,
  });

  const productBatchesQuery = useProductBatches(centralKitchenId, {
    includeZero: false,
  });

  const ingredientOptionsQuery = useIngredientOptions();
  const productOptionsQuery = useProductOptions();

  const createIngredientInbound = useCreateIngredientInboundBatch();
  const createProductInbound = useCreateProductInboundBatch();

  const adjustIngredientBatch = useAdjustIngredientBatch();
  const adjustProductBatch = useAdjustProductBatch();

  const deleteIngredientBatch = useDeleteIngredientBatch();
  const deleteProductBatch = useDeleteProductBatch();

  const isIngredientTab = activeTab === "INGREDIENT";

  const currentData = useMemo<BatchRow[]>(
    () =>
      isIngredientTab
        ? (ingredientBatchesQuery.data ?? [])
        : (productBatchesQuery.data ?? []),
    [ingredientBatchesQuery.data, productBatchesQuery.data, isIngredientTab],
  );

  const filteredData = useMemo(
    () => filterInventoryBatches(currentData, search),
    [currentData, search],
  );

  const summary = useMemo(() => getInventorySummary(filteredData), [filteredData]);

  const totalItems = useMemo(() => {
    const ids = new Set(
      filteredData.map((item) =>
        "ingredientId" in item ? item.ingredientId : item.productId,
      ),
    );
    return ids.size;
  }, [filteredData]);

  const loading =
    !centralKitchenId ||
    ingredientBatchesQuery.isLoading ||
    productBatchesQuery.isLoading;

  const refreshing =
    ingredientBatchesQuery.isFetching || productBatchesQuery.isFetching;

  const handleRefresh = async () => {
    await Promise.all([
      ingredientBatchesQuery.refetch(),
      productBatchesQuery.refetch(),
    ]);
  };

  const handleOpenAdjust = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setAdjustOpen(true);
  };

  const handleOpenDelete = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setDeleteOpen(true);
  };

  const handleCreateInbound = async (payload: {
    itemId: number;
    batchCode: string;
    quantity: number;
    createdAtUtc: string;
    reason?: string;
  }) => {
    if (!centralKitchenId) {
      toast.error("Không xác định được bếp trung tâm.");
      return;
    }

    try {
      if (isIngredientTab) {
        const res = await createIngredientInbound.mutateAsync({
          centralKitchenId,
          payload: {
            ingredientId: payload.itemId,
            batchCode: payload.batchCode,
            quantity: payload.quantity,
            createdAtUtc: payload.createdAtUtc,
            reason: payload.reason,
          },
        });

        toast.success(res.message || "Tạo lô nguyên liệu thành công.");
      } else {
        const res = await createProductInbound.mutateAsync({
          centralKitchenId,
          payload: {
            productId: payload.itemId,
            batchCode: payload.batchCode,
            quantity: payload.quantity,
            createdAtUtc: payload.createdAtUtc,
            reason: payload.reason,
          },
        });

        toast.success(res.message || "Tạo lô sản phẩm thành công.");
      }

      setCreateOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tạo lô hàng thất bại.";
      toast.error(message);
    }
  };

  const handleAdjustBatch = async (payload: {
    batchId: number;
    type: "INCREASE" | "DECREASE";
    deltaQuantity: number;
    reason: string;
    reference?: string;
  }) => {
    if (!centralKitchenId) {
      toast.error("Không xác định được bếp trung tâm.");
      return;
    }

    try {
      if (isIngredientTab) {
        const res = await adjustIngredientBatch.mutateAsync({
          centralKitchenId,
          payload,
        });

        toast.success(res.message || "Điều chỉnh lô nguyên liệu thành công.");
      } else {
        const res = await adjustProductBatch.mutateAsync({
          centralKitchenId,
          payload,
        });

        toast.success(res.message || "Điều chỉnh lô sản phẩm thành công.");
      }

      setAdjustOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Điều chỉnh lô hàng thất bại.";
      toast.error(message);
    }
  };

  const handleDeleteBatch = async () => {
    if (!centralKitchenId || !selectedBatch) {
      toast.error("Không xác định được lô cần xóa.");
      return;
    }

    try {
      if ("ingredientId" in selectedBatch) {
        const res = await deleteIngredientBatch.mutateAsync({
          centralKitchenId,
          batchId: selectedBatch.batchId,
        });

        toast.success(res.message || "Xóa lô nguyên liệu thành công.");
      } else {
        const res = await deleteProductBatch.mutateAsync({
          centralKitchenId,
          batchId: selectedBatch.batchId,
        });

        toast.success(res.message || "Xóa lô sản phẩm thành công.");
      }

      setDeleteOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xóa lô hàng thất bại.";
      toast.error(message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tồn kho bếp trung tâm"
        subtitle="Quản lý lô hàng tồn kho thực tế của nguyên liệu và sản phẩm"
      />

      <InventoryToolbar
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onCreateInbound={() => setCreateOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <InventorySummaryCards
        totalBatches={summary.totalBatches}
        totalQuantity={summary.totalQuantity}
        expiringSoonCount={summary.expiringSoonCount}
        totalItems={totalItems}
      />

      <Tabs value={activeTab}>
        <InventoryTabs value={activeTab} onChange={setActiveTab} />

        <TabsContent value="INGREDIENT">
          {filteredData.length === 0 && !loading ? (
            <EmptyInventoryState
              title="Chưa có lô nguyên liệu"
              description="Hãy tạo lô nguyên liệu đầu tiên để bắt đầu quản lý tồn kho."
            />
          ) : (
            <InventoryBatchTable
              data={filteredData}
              loading={loading}
              adjustingBatchId={
                adjustIngredientBatch.variables?.payload.batchId ??
                adjustProductBatch.variables?.payload.batchId ??
                null
              }
              deletingBatchId={
                deleteIngredientBatch.variables?.batchId ??
                deleteProductBatch.variables?.batchId ??
                null
              }
              onAdjust={handleOpenAdjust}
              onDelete={handleOpenDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="PRODUCT">
          {filteredData.length === 0 && !loading ? (
            <EmptyInventoryState
              title="Chưa có lô sản phẩm"
              description="Hãy tạo lô sản phẩm đầu tiên để bắt đầu quản lý tồn kho."
            />
          ) : (
            <InventoryBatchTable
              data={filteredData}
              loading={loading}
              adjustingBatchId={
                adjustIngredientBatch.variables?.payload.batchId ??
                adjustProductBatch.variables?.payload.batchId ??
                null
              }
              deletingBatchId={
                deleteIngredientBatch.variables?.batchId ??
                deleteProductBatch.variables?.batchId ??
                null
              }
              onAdjust={handleOpenAdjust}
              onDelete={handleOpenDelete}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateInboundBatchModal
        open={createOpen}
        activeTab={activeTab}
        ingredientOptions={ingredientOptionsQuery.options}
        productOptions={productOptionsQuery.options}
        loadingOptions={
          ingredientOptionsQuery.isLoading || productOptionsQuery.isLoading
        }
        submitting={
          createIngredientInbound.isPending || createProductInbound.isPending
        }
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateInbound}
      />

      <AdjustBatchModal
        open={adjustOpen}
        batch={selectedBatch}
        submitting={adjustIngredientBatch.isPending || adjustProductBatch.isPending}
        onClose={() => {
          setAdjustOpen(false);
          setSelectedBatch(null);
        }}
        onSubmit={handleAdjustBatch}
      />

      <DeleteBatchConfirmDialog
        open={deleteOpen}
        batch={selectedBatch}
        deleting={deleteIngredientBatch.isPending || deleteProductBatch.isPending}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedBatch(null);
        }}
        onConfirm={handleDeleteBatch}
      />
    </div>
  );
};

export default KitchenInventory;