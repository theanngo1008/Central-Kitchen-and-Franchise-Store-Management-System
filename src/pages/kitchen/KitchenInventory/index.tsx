import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { authApi } from "@/api";

import type {
  IngredientBatch,
  InventoryAdjustmentType,
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
  useIngredientBatchDetail,
  useIngredientBatches,
  useIngredientOptions,
  useProductBatchDetail,
  useProductBatches,
  useProductOptions,
  useRenameIngredientBatchCode,
  useRenameProductBatchCode,
} from "@/hooks/kitchen/useKitchenInventory";

import { filterInventoryBatches, getInventorySummary } from "./helpers";

import InventoryToolbar from "./components/InventoryToolbar";
import InventoryTabs from "./components/InventoryTabs";
import InventorySummaryCards from "./components/InventorySummaryCards";
import InventoryBatchTable from "./components/InventoryBatchTable";
import EmptyInventoryState from "./components/EmptyInventoryState";
import CreateInboundBatchModal from "./components/CreateInboundBatchModal";
import AdjustBatchModal from "./components/AdjustBatchModal";
import DeleteBatchConfirmDialog from "./components/DeleteBatchConfirmDialog";
import BatchDetailDialog from "./components/BatchDetailDialog";
import RenameBatchCodeModal from "./components/RenameBatchCodeModal";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState<BatchRow | null>(null);

  const ingredientBatchesQuery = useIngredientBatches(centralKitchenId, {
    includeZero: true,
  });

  const productBatchesQuery = useProductBatches(centralKitchenId, {
    includeZero: true,
  });

  const ingredientOptionsQuery = useIngredientOptions();
  const productOptionsQuery = useProductOptions();

  const createIngredientInbound = useCreateIngredientInboundBatch();
  const createProductInbound = useCreateProductInboundBatch();

  const adjustIngredientBatch = useAdjustIngredientBatch();
  const adjustProductBatch = useAdjustProductBatch();

  const renameIngredientBatchCode = useRenameIngredientBatchCode();
  const renameProductBatchCode = useRenameProductBatchCode();

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

  const summary = useMemo(
    () => getInventorySummary(filteredData),
    [filteredData],
  );

  const totalItems = useMemo(() => {
    const ids = new Set(
      filteredData.map((item) =>
        "ingredientId" in item ? item.ingredientId : item.productId,
      ),
    );
    return ids.size;
  }, [filteredData]);

  const ingredientBatchDetailQuery = useIngredientBatchDetail(
    centralKitchenId,
    detailOpen && selectedBatch && "ingredientId" in selectedBatch
      ? selectedBatch.batchId
      : null,
  );

  const productBatchDetailQuery = useProductBatchDetail(
    centralKitchenId,
    detailOpen && selectedBatch && "productId" in selectedBatch
      ? selectedBatch.batchId
      : null,
  );

  const detailBatch =
    selectedBatch && "ingredientId" in selectedBatch
      ? (ingredientBatchDetailQuery.data ?? selectedBatch)
      : selectedBatch && "productId" in selectedBatch
        ? (productBatchDetailQuery.data ?? selectedBatch)
        : null;

  const detailLoading =
    ingredientBatchDetailQuery.isLoading || productBatchDetailQuery.isLoading;

  const activeListQuery = isIngredientTab
    ? ingredientBatchesQuery
    : productBatchesQuery;

  const activeOptionsQuery = isIngredientTab
    ? ingredientOptionsQuery
    : productOptionsQuery;

  const loading = !centralKitchenId || activeListQuery.isLoading;
  const refreshing = activeListQuery.isFetching;
  const hasError = activeListQuery.isError;

  const handleRefresh = async () => {
    await activeListQuery.refetch();
  };

  const handleOpenAdjust = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setAdjustOpen(true);
  };

  const handleOpenDelete = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setDeleteOpen(true);
  };

  const handleOpenDetail = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setDetailOpen(true);
  };

  const handleOpenRename = (batch: BatchRow) => {
    setSelectedBatch(batch);
    setRenameOpen(true);
  };

  const resetSelection = () => {
    setSelectedBatch(null);
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
      const apiMessage = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          error.response?.data?.errorCode ||
          (Array.isArray(error.response?.data?.errors)
            ? error.response?.data?.errors?.join(". ")
            : undefined)
        : undefined;

      const message =
        apiMessage ||
        (error instanceof Error ? error.message : undefined) ||
        "Tạo lô hàng thất bại.";

      toast.error(message);
    }
  };

  const handleAdjustBatch = async (payload: {
    batchId: number;
    type: InventoryAdjustmentType;
    deltaQuantity: number;
    reason: string;
    reference?: string;
  }) => {
    if (!centralKitchenId) {
      toast.error("Không xác định được bếp trung tâm.");
      return;
    }

    const normalizedPayload = {
      ...payload,
      deltaQuantity:
        payload.type === "WASTE"
          ? -Math.abs(payload.deltaQuantity)
          : Math.abs(payload.deltaQuantity),
    };

    try {
      if (selectedBatch && "ingredientId" in selectedBatch) {
        const res = await adjustIngredientBatch.mutateAsync({
          centralKitchenId,
          payload: normalizedPayload,
        });

        toast.success(res.message || "Điều chỉnh lô nguyên liệu thành công.");
      } else if (selectedBatch && "productId" in selectedBatch) {
        const res = await adjustProductBatch.mutateAsync({
          centralKitchenId,
          payload: normalizedPayload,
        });

        toast.success(res.message || "Điều chỉnh lô sản phẩm thành công.");
      } else {
        toast.error("Không xác định được lô cần điều chỉnh.");
        return;
      }

      setAdjustOpen(false);
      resetSelection();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Điều chỉnh lô hàng thất bại.";
      toast.error(message);
    }
  };

  const handleRenameBatchCode = async (payload: {
    batchCode: string;
    reason?: string;
  }) => {
    if (!centralKitchenId || !selectedBatch) {
      toast.error("Không xác định được lô cần đổi mã.");
      return;
    }

    try {
      if ("ingredientId" in selectedBatch) {
        const res = await renameIngredientBatchCode.mutateAsync({
          centralKitchenId,
          batchId: selectedBatch.batchId,
          payload,
        });

        toast.success(res.message || "Đổi mã lô nguyên liệu thành công.");
      } else {
        const res = await renameProductBatchCode.mutateAsync({
          centralKitchenId,
          batchId: selectedBatch.batchId,
          payload,
        });

        toast.success(res.message || "Đổi mã lô sản phẩm thành công.");
      }

      setRenameOpen(false);
      resetSelection();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đổi mã lô thất bại.";
      toast.error(message);
    }
  };

  const handleDeleteBatch = async (reason: string) => {
    if (!centralKitchenId || !selectedBatch) {
      toast.error("Không xác định được lô cần xóa.");
      return;
    }

    if (selectedBatch.quantity > 0) {
      toast.error("Chỉ được xóa lô khi số lượng bằng 0.");
      return;
    }

    try {
      console.log("Delete batch reason:", reason);

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
      resetSelection();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xóa lô thất bại.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tồn kho bếp trung tâm" />

      <InventoryToolbar
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCreateInbound={() => setCreateOpen(true)}
      />

      <InventorySummaryCards
        totalBatches={filteredData.length}
        totalItems={totalItems}
        totalQuantity={summary.totalQuantity}
        expiringSoonCount={summary.expiringSoonCount}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as KitchenInventoryTab)}
        className="space-y-4"
      >
        <InventoryTabs value={activeTab} onChange={setActiveTab} />

        <TabsContent value="INGREDIENT" className="space-y-4">
          {loading ? (
            <EmptyInventoryState
              title="Đang tải dữ liệu"
              description="Vui lòng chờ trong giây lát..."
            />
          ) : hasError ? (
            <EmptyInventoryState
              title="Không tải được tồn kho nguyên liệu"
              description="Đã có lỗi khi tải dữ liệu. Vui lòng thử lại."
            />
          ) : filteredData.length === 0 ? (
            <EmptyInventoryState
              title="Chưa có lô nguyên liệu"
              description="Hiện chưa có dữ liệu phù hợp với bộ lọc hiện tại."
            />
          ) : (
            <InventoryBatchTable
              data={filteredData}
              loading={loading}
              onViewDetail={handleOpenDetail}
              onAdjust={handleOpenAdjust}
              onRename={handleOpenRename}
              onDelete={handleOpenDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="PRODUCT" className="space-y-4">
          {loading ? (
            <EmptyInventoryState
              title="Đang tải dữ liệu"
              description="Vui lòng chờ trong giây lát..."
            />
          ) : hasError ? (
            <EmptyInventoryState
              title="Không tải được tồn kho sản phẩm"
              description="Đã có lỗi khi tải dữ liệu. Vui lòng thử lại."
            />
          ) : filteredData.length === 0 ? (
            <EmptyInventoryState
              title="Chưa có lô sản phẩm"
              description="Hiện chưa có dữ liệu phù hợp với bộ lọc hiện tại."
            />
          ) : (
            <InventoryBatchTable
              data={filteredData}
              loading={loading}
              onViewDetail={handleOpenDetail}
              onAdjust={handleOpenAdjust}
              onRename={handleOpenRename}
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
        loadingOptions={activeOptionsQuery.isLoading}
        optionsError={activeOptionsQuery.isError}
        submitting={
          createIngredientInbound.isPending || createProductInbound.isPending
        }
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateInbound}
      />

      <AdjustBatchModal
        open={adjustOpen}
        batch={selectedBatch}
        submitting={
          adjustIngredientBatch.isPending || adjustProductBatch.isPending
        }
        onClose={() => {
          setAdjustOpen(false);
          resetSelection();
        }}
        onSubmit={handleAdjustBatch}
      />

      <RenameBatchCodeModal
        open={renameOpen}
        batch={selectedBatch}
        submitting={
          renameIngredientBatchCode.isPending ||
          renameProductBatchCode.isPending
        }
        onClose={() => {
          setRenameOpen(false);
          resetSelection();
        }}
        onSubmit={handleRenameBatchCode}
      />

      <DeleteBatchConfirmDialog
        open={deleteOpen}
        batch={selectedBatch}
        onClose={() => {
          setDeleteOpen(false);
          resetSelection();
        }}
        onConfirm={handleDeleteBatch}
      />

      <BatchDetailDialog
        open={detailOpen}
        batch={detailBatch}
        loading={detailLoading}
        onClose={() => {
          setDetailOpen(false);
          resetSelection();
        }}
      />
    </div>
  );
};

export default KitchenInventory;
