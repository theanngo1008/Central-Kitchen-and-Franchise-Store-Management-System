import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/api";
import { useStoreInventorySummary } from "@/hooks/store/useInventory";
import {
  useStoreInventoryBatchLifecycle,
  useStoreInventoryHistoryMovements,
} from "@/hooks/store/useInventoryHistory";
import type {
  StoreInventoryHistoryEventType,
  StoreInventoryHistoryItemType,
  StoreInventoryHistoryMovement,
  StoreInventoryHistorySortDir,
} from "@/types/store/inventoryHistory.types";
import {
  Eye,
  RefreshCw,
  SearchX,
  Truck,
  Package,
  ArrowDownUp,
} from "lucide-react";

const DEFAULT_PAGE_SIZE = 20;

const EVENT_OPTIONS: Array<{
  label: string;
  value: StoreInventoryHistoryEventType;
}> = [
  { label: "Nhập lô", value: "Inbound" },
  { label: "Điều chỉnh", value: "Adjust" },
  { label: "Hao hụt / hủy", value: "Waste" },
  { label: "Xuất cho sản xuất", value: "IssueProd" },
  { label: "Chuẩn bị xuất", value: "PrepareOut" },
  { label: "Vào transit", value: "TransitIn" },
  { label: "Ra khỏi transit", value: "TransitOut" },
  { label: "Nhập vào tồn kho", value: "ReceiveIn" },
  { label: "Đổi mã lô", value: "Rename" },
  { label: "Lưu trữ / xóa row hiện tại", value: "Archive" },
  { label: "Hoàn tác", value: "Reverse" },
];

const ITEM_TYPE_OPTIONS = [
  { label: "Nguyên liệu", value: "INGREDIENT" },
  { label: "Sản phẩm", value: "PRODUCT" },
] as const;

const SORT_OPTIONS: Array<{
  label: string;
  value: StoreInventoryHistorySortDir;
}> = [
  { label: "Mới nhất trước", value: "desc" },
  { label: "Cũ nhất trước", value: "asc" },
];

type TableRow = StoreInventoryHistoryMovement & {
  id: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getEventLabel = (eventType: StoreInventoryHistoryEventType) => {
  const map: Record<StoreInventoryHistoryEventType, string> = {
    Inbound: "Nhập lô",
    Adjust: "Điều chỉnh",
    Waste: "Hao hụt / hủy",
    IssueProd: "Xuất cho sản xuất",
    PrepareOut: "Chuẩn bị xuất",
    TransitIn: "Vào transit",
    TransitOut: "Ra khỏi transit",
    ReceiveIn: "Nhập vào tồn kho",
    Rename: "Đổi mã lô",
    Archive: "Lưu trữ / xóa row hiện tại",
    Reverse: "Hoàn tác",
  };

  return map[eventType] ?? eventType;
};

const formatDeltaQuantity = (item: StoreInventoryHistoryMovement) => {
  if (item.deltaQuantity > 0) return `+${item.deltaQuantity} ${item.itemUnit}`;
  if (item.deltaQuantity < 0) return `${item.deltaQuantity} ${item.itemUnit}`;
  return `0 ${item.itemUnit}`;
};

const getDeltaClassName = (item: StoreInventoryHistoryMovement) => {
  if (item.isNonStockEvent || item.deltaQuantity === 0) {
    return "text-muted-foreground";
  }

  if (item.deltaQuantity > 0) return "text-emerald-600";
  return "text-destructive";
};

const sortTimelineOldestFirst = (timeline: StoreInventoryHistoryMovement[]) => {
  return [...timeline].sort((a, b) => {
    const aTime = new Date(a.occurredAtUtc).getTime();
    const bTime = new Date(b.occurredAtUtc).getTime();

    if (aTime !== bTime) return aTime - bTime;
    if (a.correlationId !== b.correlationId) {
      return a.correlationId.localeCompare(b.correlationId);
    }
    if (a.sequenceNo !== b.sequenceNo) return a.sequenceNo - b.sequenceNo;
    return a.inventoryLedgerEntryId - b.inventoryLedgerEntryId;
  });
};

const StoreInventoryHistory: React.FC = () => {
  const user = authApi.getCurrentUser();
  const franchiseId = user?.franchiseId ? Number(user.franchiseId) : undefined;

  const [itemType, setItemType] = useState<string>("ALL");
  const [itemId, setItemId] = useState<string>("ALL");
  const [batchId, setBatchId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [eventType, setEventType] = useState<string>("ALL");
  const [sortDir, setSortDir] = useState<StoreInventoryHistorySortDir>("desc");
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [page, setPage] = useState(1);

  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] =
    useState<StoreInventoryHistoryMovement | null>(null);

  const {
    data: summaryResponse,
  } = useStoreInventorySummary(franchiseId ?? 0);

  const summaryItems = summaryResponse?.items ?? [];

  useEffect(() => {
    setItemId("ALL");
  }, [itemType]);

  const itemOptions = useMemo(() => {
    if (itemType === "ALL") return [];

    return summaryItems
      .filter((item) => item.itemType === itemType)
      .map((item) => ({
        value: String(item.itemId),
        label: `${item.itemName} (${item.unit})`,
      }));
  }, [summaryItems, itemType]);

  const movementParams = useMemo(() => {
    const normalizedFromUtc = fromUtc
      ? new Date(fromUtc).toISOString()
      : undefined;
    const normalizedToUtc = toUtc ? new Date(toUtc).toISOString() : undefined;

    return {
      itemType:
        itemType !== "ALL" ? (itemType as StoreInventoryHistoryItemType) : undefined,
      itemId:
        itemType !== "ALL" && itemId !== "ALL" ? Number(itemId) : undefined,
      batchId: batchId.trim() ? Number(batchId) : undefined,
      deliveryId: deliveryId.trim() ? Number(deliveryId) : undefined,
      eventType:
        eventType !== "ALL"
          ? (eventType as StoreInventoryHistoryEventType)
          : undefined,
      fromUtc: normalizedFromUtc,
      toUtc: normalizedToUtc,
      sortDir,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [itemType, itemId, batchId, deliveryId, eventType, fromUtc, toUtc, sortDir, page]);

  const movementsQuery = useStoreInventoryHistoryMovements(
    franchiseId,
    movementParams,
  );

  const lifecycleQuery = useStoreInventoryBatchLifecycle(
    franchiseId,
    lifecycleOpen ? selectedMovement?.batchId ?? null : null,
    lifecycleOpen ? selectedMovement?.itemType : undefined,
  );

  const movements = movementsQuery.data?.items ?? [];
  const totalItems = movementsQuery.data?.totalItems ?? 0;
  const totalPages = movementsQuery.data?.totalPages ?? 0;

  const tableData = useMemo<TableRow[]>(
    () =>
      movements.map((item) => ({
        ...item,
        id: String(item.inventoryLedgerEntryId),
      })),
    [movements],
  );

  const loading = !franchiseId || movementsQuery.isLoading;
  const refreshing = movementsQuery.isFetching;

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

  const columns = [
    {
      key: "occurredAtUtc",
      label: "Thời điểm",
      render: (item: TableRow) => formatDateTime(item.occurredAtUtc),
    },
    {
      key: "itemName",
      label: "Mặt hàng",
      render: (item: TableRow) => (
        <div className="space-y-1">
          <p className="font-medium">{item.itemName}</p>
          <p className="text-xs text-muted-foreground">
            {item.itemType === "PRODUCT" ? "Thành phẩm" : "Nguyên liệu"}
          </p>
        </div>
      ),
    },
    {
      key: "batchCode",
      label: "Mã lô",
      render: (item: TableRow) => (
        <div className="space-y-1">
          <p className="font-medium">{item.batchCode}</p>
          <p className="text-xs text-muted-foreground">Batch ID: {item.batchId}</p>
        </div>
      ),
    },
    {
      key: "eventType",
      label: "Sự kiện",
      render: (item: TableRow) => (
        <div className="space-y-1">
          <p>{getEventLabel(item.eventType)}</p>
          <p className="text-xs text-muted-foreground">{item.stockBucket}</p>
        </div>
      ),
    },
    {
      key: "deltaQuantity",
      label: "Biến động",
      render: (item: TableRow) => (
        <span className={getDeltaClassName(item)}>
          {formatDeltaQuantity(item)}
        </span>
      ),
    },
    {
      key: "meta",
      label: "Diễn giải",
      render: (item: TableRow) => (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {item.deliveryCode || item.orderCode || item.reason || "--"}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.actorDisplay || "--"}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: TableRow) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedMovement(item);
            setLifecycleOpen(true);
          }}
        >
          <Eye size={16} className="mr-1" />
          Xem vòng đời
        </Button>
      ),
    },
  ];

  if (!franchiseId) {
    return (
      <div className="p-8 text-center border rounded-xl bg-muted/20">
        Không tìm thấy mã Cửa hàng.
      </div>
    );
  }

  const timeline = lifecycleQuery.data
    ? sortTimelineOldestFirst(lifecycleQuery.data.timeline)
    : [];

  return (
    <div className="animate-fade-in pb-10 space-y-6">
      <PageHeader
        title="Lịch sử tồn kho cửa hàng"
        subtitle="Tra cứu biến động tồn kho và vòng đời từng lô hàng tại cửa hàng"
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => void movementsQuery.refetch()}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Select value={itemType} onValueChange={setItemType}>
            <SelectTrigger>
              <SelectValue placeholder="Loại mặt hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {ITEM_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo mặt hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả mặt hàng</SelectItem>
              {itemOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Batch ID"
            inputMode="numeric"
          />

          <Input
            value={deliveryId}
            onChange={(e) => setDeliveryId(e.target.value)}
            placeholder="Delivery ID"
            inputMode="numeric"
          />

          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Loại sự kiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả sự kiện</SelectItem>
              {EVENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortDir}
            onValueChange={(value) =>
              setSortDir(value as StoreInventoryHistorySortDir)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Thứ tự thời gian" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="datetime-local"
            value={fromUtc}
            onChange={(e) => setFromUtc(e.target.value)}
          />

          <Input
            type="datetime-local"
            value={toUtc}
            onChange={(e) => setToUtc(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleResetFilters}>
            <SearchX size={16} className="mr-2" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-md">
            <Package size={14} className="text-primary" /> TỔNG MOVEMENTS
          </p>
          <p className="text-3xl font-bold tracking-tight">{totalItems}</p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-md">
            <Truck size={14} className="text-amber-600" /> TRANG HIỆN TẠI
          </p>
          <p className="text-3xl font-bold tracking-tight">{page}</p>
        </div>

        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1 font-medium bg-muted/50 w-fit px-2 py-0.5 rounded-md">
            <ArrowDownUp size={14} className="text-blue-600" /> TỔNG SỐ TRANG
          </p>
          <p className="text-3xl font-bold tracking-tight">{totalPages}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary/40" />
          <p>Đang tải lịch sử tồn kho...</p>
        </div>
      ) : movementsQuery.isError ? (
        <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-destructive/5 max-w-md mx-auto my-10">
          <p className="mb-6 font-medium text-destructive">
            Không thể tải dữ liệu lịch sử tồn kho.
          </p>
          <Button
            onClick={() => void movementsQuery.refetch()}
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      ) : tableData.length === 0 ? (
        <div className="bg-card rounded-xl border shadow-sm p-8 text-center text-muted-foreground">
          Không có dữ liệu lịch sử tồn kho phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <DataTable columns={columns} data={tableData} />
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
            disabled={totalPages > 0 ? page >= totalPages : tableData.length === 0}
          >
            Trang sau
          </Button>
        </div>
      </div>

      <Dialog
        open={lifecycleOpen}
        onOpenChange={(value) => {
          if (!value) {
            setLifecycleOpen(false);
            setSelectedMovement(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vòng đời lô hàng tại cửa hàng</DialogTitle>
          </DialogHeader>

          {lifecycleQuery.isLoading ? (
            <div className="py-6 text-sm text-muted-foreground">
              Đang tải vòng đời batch...
            </div>
          ) : !lifecycleQuery.data ? (
            <div className="py-6 text-sm text-muted-foreground">
              Không có dữ liệu vòng đời cho batch này.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Tên mặt hàng</p>
                    <p className="font-medium">{lifecycleQuery.data.itemName}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Loại</p>
                    <p className="font-medium">
                      {lifecycleQuery.data.itemType === "PRODUCT"
                        ? "Thành phẩm"
                        : "Nguyên liệu"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Batch ID</p>
                    <p className="font-medium">{lifecycleQuery.data.batchId}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Mã lô hiện tại</p>
                    <p className="font-medium">
                      {lifecycleQuery.data.currentBatchCode || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Ngày tạo lô</p>
                    <p className="font-medium">
                      {formatDate(lifecycleQuery.data.batchCreatedAtUtc)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Hạn sử dụng</p>
                    <p className="font-medium">
                      {formatDate(lifecycleQuery.data.expiredAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Số lượng hiện tại</p>
                    <p className="font-medium">
                      {lifecycleQuery.data.currentQuantity ?? "--"}{" "}
                      {lifecycleQuery.data.itemUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Bucket hiện tại</p>
                    <p className="font-medium">
                      {lifecycleQuery.data.currentBucket || "--"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                  {lifecycleQuery.data.currentBatchExists
                    ? lifecycleQuery.data.currentBucket === "TRANSIT"
                      ? "Batch hiện đang ở transit."
                      : "Batch hiện đang ở tồn khả dụng."
                    : "Batch current-state không còn tồn tại, nhưng lịch sử vẫn được lưu."}
                </div>
              </div>

              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                    Chưa có dữ liệu timeline cho batch này.
                  </div>
                ) : (
                  timeline.map((item) => (
                    <div
                      key={item.inventoryLedgerEntryId}
                      className="rounded-lg border bg-background p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{getEventLabel(item.eventType)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(item.occurredAtUtc)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Bucket: {item.stockBucket}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className={`font-medium ${getDeltaClassName(item)}`}>
                            {formatDeltaQuantity(item)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.actorDisplay || "--"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Lý do / diễn giải</p>
                          <p>{item.reason || "--"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Delivery / Order</p>
                          <p>{item.deliveryCode || item.orderCode || "--"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">
                            Requested / Actual / Dropped
                          </p>
                          <p>
                            {item.requestedQuantitySnapshot ?? "--"} /{" "}
                            {item.actualQuantitySnapshot ?? "--"} /{" "}
                            {item.droppedQuantitySnapshot ?? "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Counterparty batch</p>
                          <p>{item.counterpartyBatchId ?? "--"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreInventoryHistory;