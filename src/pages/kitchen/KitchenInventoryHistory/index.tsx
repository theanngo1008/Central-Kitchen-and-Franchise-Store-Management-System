import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api";
import { useIngredientOptions, useProductOptions } from "@/hooks/kitchen/useKitchenInventory";
import {
  useKitchenBatchLifecycle,
  useKitchenInventoryHistoryMovements,
} from "@/hooks/kitchen/useKitchenInventoryHistory";
import type {
  InventoryHistoryEventType,
  InventoryHistoryItemType,
  InventoryHistorySortDir,
  KitchenInventoryHistoryMovement,
} from "@/types/kitchen/inventoryHistory.types";
import { INVENTORY_HISTORY_DEFAULT_PAGE_SIZE } from "./constants";
import InventoryHistoryToolbar from "./components/InventoryHistoryToolbar";
import InventoryHistoryFilterBar from "./components/InventoryHistoryFilterBar";
import InventoryHistoryTable from "./components/InventoryHistoryTable";
import InventoryHistoryEmptyState from "./components/InventoryHistoryEmptyState";
import BatchLifecycleDialog from "./components/BatchLifecycleDialog";

const KitchenInventoryHistory: React.FC = () => {
  const user = authApi.getCurrentUser();
  const centralKitchenId = user?.centralKitchenId
    ? Number(user.centralKitchenId)
    : undefined;

  const [itemType, setItemType] = useState<string>("ALL");
  const [itemId, setItemId] = useState<string>("ALL");
  const [batchId, setBatchId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [eventType, setEventType] = useState<string>("ALL");
  const [sortDir, setSortDir] = useState<InventoryHistorySortDir>("desc");
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [page, setPage] = useState(1);

  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<KitchenInventoryHistoryMovement | null>(null);

  useEffect(() => {
    setItemId("ALL");
  }, [itemType]);

  const ingredientOptionsQuery = useIngredientOptions();
  const productOptionsQuery = useProductOptions();

  const activeItemOptions = useMemo(() => {
    if (itemType === "INGREDIENT") {
      return ingredientOptionsQuery.options.map((item) => ({
        value: String(item.value),
        label: item.label,
      }));
    }

    if (itemType === "PRODUCT") {
      return productOptionsQuery.options.map((item) => ({
        value: String(item.value),
        label: item.label,
      }));
    }

    return [];
  }, [ingredientOptionsQuery.options, productOptionsQuery.options, itemType]);

  const movementParams = useMemo(() => {
    const normalizedFromUtc = fromUtc ? new Date(fromUtc).toISOString() : undefined;
    const normalizedToUtc = toUtc ? new Date(toUtc).toISOString() : undefined;

    return {
      itemType:
        itemType !== "ALL" ? (itemType as InventoryHistoryItemType) : undefined,
      itemId: itemType !== "ALL" && itemId !== "ALL" ? Number(itemId) : undefined,
      batchId: batchId.trim() ? Number(batchId) : undefined,
      deliveryId: deliveryId.trim() ? Number(deliveryId) : undefined,
      eventType:
        eventType !== "ALL"
          ? (eventType as InventoryHistoryEventType)
          : undefined,
      fromUtc: normalizedFromUtc,
      toUtc: normalizedToUtc,
      sortDir,
      page,
      pageSize: INVENTORY_HISTORY_DEFAULT_PAGE_SIZE,
    };
  }, [itemType, itemId, batchId, deliveryId, eventType, fromUtc, toUtc, sortDir, page]);

  const movementsQuery = useKitchenInventoryHistoryMovements(
    centralKitchenId,
    movementParams,
  );

  const lifecycleQuery = useKitchenBatchLifecycle(
    centralKitchenId,
    lifecycleOpen ? selectedMovement?.batchId ?? null : null,
    lifecycleOpen
      ? selectedMovement?.itemType
      : undefined,
  );

  const movements = movementsQuery.data?.items ?? [];
  const totalPages = movementsQuery.data?.totalPages ?? 0;
  const totalItems = movementsQuery.data?.totalItems ?? 0;

  const loading = !centralKitchenId || movementsQuery.isLoading;
  const refreshing = movementsQuery.isFetching;

  const handleRefresh = async () => {
    await movementsQuery.refetch();
  };

  const handleResetFilters = () => {
    setItemType("ALL");
    setItemId("ALL");
    setBatchId("");
    setDeliveryId("");
    setEventType("ALL");
    setSortDir("desc");
    setFromUtc("");
    setToUtc("");
    setPage(1);
  };

  const handleOpenLifecycle = (movement: KitchenInventoryHistoryMovement) => {
    setSelectedMovement(movement);
    setLifecycleOpen(true);
  };

  const handleCloseLifecycle = () => {
    setLifecycleOpen(false);
    setSelectedMovement(null);
  };

  useEffect(() => {
    setPage(1);
  }, [itemType, itemId, batchId, deliveryId, eventType, sortDir, fromUtc, toUtc]);

  useEffect(() => {
    if (!movementsQuery.isError) return;

    const error = movementsQuery.error;
    const apiMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        error.response?.data?.errorCode ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response?.data?.errors.join(". ")
          : undefined)
      : undefined;

    if (apiMessage) toast.error(apiMessage);
  }, [movementsQuery.isError, movementsQuery.error]);

  useEffect(() => {
    if (!lifecycleQuery.isError || !lifecycleOpen) return;

    const error = lifecycleQuery.error;
    const apiMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        error.response?.data?.errorCode ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response?.data?.errors.join(". ")
          : undefined)
      : undefined;

    if (apiMessage) toast.error(apiMessage);
  }, [lifecycleQuery.isError, lifecycleQuery.error, lifecycleOpen]);

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch sử tồn kho bếp trung tâm" />

      <InventoryHistoryToolbar
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <InventoryHistoryFilterBar
        itemType={itemType}
        onItemTypeChange={setItemType}
        itemId={itemId}
        onItemIdChange={setItemId}
        itemOptions={activeItemOptions}
        batchId={batchId}
        onBatchIdChange={setBatchId}
        deliveryId={deliveryId}
        onDeliveryIdChange={setDeliveryId}
        eventType={eventType}
        onEventTypeChange={setEventType}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
        fromUtc={fromUtc}
        onFromUtcChange={setFromUtc}
        toUtc={toUtc}
        onToUtcChange={setToUtc}
        onReset={handleResetFilters}
      />

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Tổng số movements</p>
            <p className="text-2xl font-semibold">{totalItems}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Trang hiện tại</p>
            <p className="text-2xl font-semibold">{page}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tổng số trang</p>
            <p className="text-2xl font-semibold">{totalPages}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <InventoryHistoryEmptyState
          title="Đang tải lịch sử tồn kho"
          description="Vui lòng chờ trong giây lát..."
        />
      ) : movementsQuery.isError ? (
        <InventoryHistoryEmptyState
          title="Không tải được lịch sử tồn kho"
          description="Đã có lỗi khi tải dữ liệu. Vui lòng kiểm tra lại bộ lọc hoặc thử lại."
        />
      ) : movements.length === 0 ? (
        <InventoryHistoryEmptyState
          title="Chưa có dữ liệu lịch sử"
          description="Không tìm thấy movement nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <InventoryHistoryTable
          data={movements}
          loading={loading}
          onViewLifecycle={handleOpenLifecycle}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {Math.max(totalPages, 1)}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
          >
            Trang trước
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPage((prev) =>
                totalPages > 0 ? Math.min(prev + 1, totalPages) : prev + 1,
              )
            }
            disabled={totalPages > 0 ? page >= totalPages : movements.length === 0}
          >
            Trang sau
          </Button>
        </div>
      </div>

      <BatchLifecycleDialog
        open={lifecycleOpen}
        loading={lifecycleQuery.isLoading}
        lifecycle={lifecycleQuery.data ?? null}
        onClose={handleCloseLifecycle}
      />
    </div>
  );
};

export default KitchenInventoryHistory;