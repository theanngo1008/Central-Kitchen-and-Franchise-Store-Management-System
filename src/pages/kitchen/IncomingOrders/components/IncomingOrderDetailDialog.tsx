import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Send,
  AlertTriangle,
  PackageCheck,
  X,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";

import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import { useIncomingOrderHistory } from "@/hooks/kitchen/useIncomingOrderHistory";
import {
  formatDate,
  formatDateTime,
  getInsufficientStockItems,
  getOrderDisplayCode,
  getOrderTimeline,
  getOrderTotalQuantity,
  hasIncomingOrderInventoryCheckData,
  hasSufficientCentralKitchenStock,
} from "../helpers";
import {
  getPartiallyForwardedItems,
  getDroppedItems,
  hasPartialOrDroppedItems,
  hasForwardSnapshotWarning,
  getForwardSnapshotWarnings,
} from "@/helpers/incomingOrderHelpers";

type Props = {
  order: IncomingOrder | null;
  open: boolean;
  onClose: () => void;
  onSaveProcessingNote?: (
    order: IncomingOrder,
    note: string,
  ) => Promise<void> | void;
  onForwardToSupply?: (
    order: IncomingOrder,
    note: string,
  ) => Promise<void> | void;
  savingProcessingNote?: boolean;
  forwardingToSupply?: boolean;
  loading?: boolean;
  centralKitchenId: number;
};

const ALLOWED_NOTE_STATUSES = new Set([
  "RECEIVED_BY_KITCHEN",
  "FORWARDED_TO_SUPPLY",
]);

const IncomingOrderDetailDialog: React.FC<Props> = ({
  order,
  open,
  onClose,
  onSaveProcessingNote,
  onForwardToSupply,
  savingProcessingNote = false,
  forwardingToSupply = false,
  loading = false,
  centralKitchenId,
}) => {
  const [noteValue, setNoteValue] = useState("");
  const [forwardNoteValue, setForwardNoteValue] = useState("");

  const { data: history = [], isLoading: historyLoading } =
    useIncomingOrderHistory(centralKitchenId, order?.storeOrderId ?? 0);

  useEffect(() => {
    setNoteValue(order?.processingNote ?? "");
  }, [order?.storeOrderId, order?.processingNote, open]);

  useEffect(() => {
    setForwardNoteValue(order?.forwardNote ?? "");
  }, [order?.storeOrderId, order?.forwardNote, open]);

  const timeline = useMemo(
    () => (order ? getOrderTimeline(order) : []),
    [order],
  );

  const totalQty = useMemo(
    () => (order ? getOrderTotalQuantity(order) : 0),
    [order],
  );

  const hasInventoryCheckData = useMemo(
    () => (order ? hasIncomingOrderInventoryCheckData(order) : false),
    [order],
  );

  const hasEnoughStock = useMemo(
    () => (order ? hasSufficientCentralKitchenStock(order) : true),
    [order],
  );

  const insufficientItems = useMemo(
    () => (order ? getInsufficientStockItems(order) : []),
    [order],
  );

  const partialItems = useMemo(
    () => (order ? getPartiallyForwardedItems(order) : []),
    [order],
  );

  const droppedItems = useMemo(
    () => (order ? getDroppedItems(order) : []),
    [order],
  );

  const hasPartialOrDropped = useMemo(
    () => (order ? hasPartialOrDroppedItems(order) : false),
    [order],
  );

  const hasSnapshotWarning = useMemo(
    () => (order ? hasForwardSnapshotWarning(order) : false),
    [order],
  );

  const snapshotWarnings = useMemo(
    () => (order ? getForwardSnapshotWarnings(order) : []),
    [order],
  );

  if (!open) return null;

  const canEditProcessingNote = order
    ? ALLOWED_NOTE_STATUSES.has(order.status)
    : false;

  const canForwardByStatus = order
    ? order.status === "RECEIVED_BY_KITCHEN"
    : false;

  const canForwardToSupply = canForwardByStatus;

  const shouldShowForwardSection = order
    ? order.status === "RECEIVED_BY_KITCHEN" ||
      order.status === "FORWARDED_TO_SUPPLY"
    : false;

  const isNoteChanged = order
    ? (noteValue ?? "").trim() !== (order.processingNote ?? "").trim()
    : false;

  const handleSave = async () => {
    if (!order || !onSaveProcessingNote || !canEditProcessingNote) return;
    await onSaveProcessingNote(order, noteValue.trim());
  };

  const handleForward = async () => {
    if (!order || !onForwardToSupply || !canForwardToSupply) return;
    await onForwardToSupply(order, forwardNoteValue.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order
              ? `Đơn hàng ${getOrderDisplayCode(order)}`
              : "Đang tải chi tiết đơn hàng..."}
          </DialogTitle>
        </DialogHeader>

        {loading || !order ? (
          <div className="py-6 text-sm text-muted-foreground">
            Đang tải chi tiết đơn hàng...
          </div>
        ) : (
          <div className="space-y-5">
            {hasPartialOrDropped && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">
                      Đơn hàng được gửi một phần
                    </h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      Do tồn kho tại bếp không đủ, một số mặt hàng sẽ được gửi
                      một phần hoặc không gửi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasSnapshotWarning ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="w-full">
                    <h3 className="font-semibold text-amber-900">
                      Có dữ liệu forward cũ cần lưu ý
                    </h3>
                    {snapshotWarnings.length > 0 ? (
                      <ul className="mt-2 list-disc pl-5 text-sm text-amber-800 space-y-1">
                        {snapshotWarnings.map((warning, index) => (
                          <li key={`${warning}-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-amber-800">
                        Hệ thống đang dùng giá trị đã chuẩn hóa để hiển thị.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cửa hàng</p>
                <div className="flex flex-col">
                  <p className="font-medium">
                    {order.storeName || order.franchiseName}
                  </p>
                  {order.storeAddress && (
                    <p className="text-[10px] text-muted-foreground italic">
                      {order.storeAddress}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <p className="text-muted-foreground">Ngày giao yêu cầu</p>
                <p className="font-medium">
                  {formatDate(order.requestedDeliveryDate || order.orderDate)}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Thời gian tạo</p>
                <p>{formatDateTime(order.createdAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Thời gian gửi</p>
                <p>{formatDateTime(order.submittedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Thời gian khóa</p>
                <p>{formatDateTime(order.lockedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Thời gian tiếp nhận</p>
                <p>{formatDateTime(order.receivedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Người tiếp nhận</p>
                <p>{order.receivedBy || "--"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Thời gian chuyển Cung ứng
                </p>
                <p>{formatDateTime(order.forwardedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Người chuyển Cung ứng</p>
                <p>{order.forwardedBy || "--"}</p>
              </div>

              {order.storeNote && (
                <div className="col-span-2 mt-2 rounded-lg border border-dashed bg-muted/30 p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Ghi chú từ Cửa hàng
                  </p>
                  <p className="text-sm italic">"{order.storeNote}"</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Ghi chú xử lý</p>
                {order.processingNoteUpdatedAt && (
                  <span className="text-xs text-muted-foreground">
                    Cập nhật lúc {formatDateTime(order.processingNoteUpdatedAt)}
                    {order.processingNoteUpdatedBy
                      ? ` bởi ${order.processingNoteUpdatedBy}`
                      : ""}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <Textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Nhập ghi chú xử lý cho đơn hàng..."
                  disabled={!canEditProcessingNote || savingProcessingNote}
                  rows={4}
                />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {canEditProcessingNote
                      ? "Có thể cập nhật ghi chú khi đơn ở trạng thái Bếp đã tiếp nhận hoặc Đã chuyển Cung ứng."
                      : "Không thể cập nhật ghi chú ở trạng thái hiện tại."}
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={
                      !canEditProcessingNote ||
                      savingProcessingNote ||
                      !isNoteChanged
                    }
                  >
                    <Save size={16} className="mr-2" />
                    {savingProcessingNote ? "Đang lưu..." : "Lưu ghi chú"}
                  </Button>
                </div>
              </div>
            </div>

            {shouldShowForwardSection && (
              <div className="border-t pt-4">
                <p className="mb-3 font-medium">Chuyển sang Cung ứng</p>

                {order.status === "RECEIVED_BY_KITCHEN" ? (
                  <div className="space-y-3">
                    <Textarea
                      value={forwardNoteValue}
                      onChange={(e) => setForwardNoteValue(e.target.value)}
                      placeholder="Nhập ghi chú khi chuyển sang Cung ứng..."
                      disabled={forwardingToSupply || !canForwardToSupply}
                      rows={3}
                    />

                    {hasInventoryCheckData && !hasEnoughStock && (
                      <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm">
                        <p className="font-medium text-yellow-800">
                          Lưu ý: Một số mặt hàng thiếu tồn kho sẽ bị HỦY tự động
                          khi chuyển sang Bộ phận Cung ứng.
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Hệ thống sẽ chỉ giao các sản phẩm có đủ tồn kho. Các
                          mặt hàng sau đây sẽ bị xóa khỏi đơn thực tế:
                        </p>

                        {insufficientItems.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {insufficientItems.map((item) => (
                              <li key={item.productId}>
                                • {item.productName}: cần {item.quantity}{" "}
                                {item.unit}, hiện có{" "}
                                {item.availableInCentralKitchenQuantity ?? 0}{" "}
                                {item.unit}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {hasInventoryCheckData && !hasEnoughStock
                          ? "Các mặt hàng thiếu sẽ tự động bị hủy/drop khi nhấn chuyển."
                          : "Chỉ có thể chuyển sang Cung ứng khi đơn ở trạng thái Bếp đã tiếp nhận."}
                      </p>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleForward}
                        disabled={forwardingToSupply || !canForwardToSupply}
                      >
                        <Send size={16} className="mr-2" />
                        {forwardingToSupply
                          ? "Đang chuyển..."
                          : "Chuyển sang Cung ứng"}
                      </Button>
                    </div>
                  </div>
                ) : order.status === "FORWARDED_TO_SUPPLY" ? (
                  <div className="rounded-md bg-muted/30 p-3 text-sm">
                    <p className="text-muted-foreground">
                      Đơn đã được chuyển sang Bộ phận Cung ứng.
                    </p>
                    {order.forwardNote?.trim() ? (
                      <div className="mt-2">
                        <p className="mb-1 text-muted-foreground">
                          Ghi chú khi chuyển đơn
                        </p>
                        <p className="font-medium whitespace-pre-wrap">
                          {order.forwardNote}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="border-t pt-4">
              <p className="mb-3 font-medium">Tiến trình xử lý</p>

              <div className="space-y-2 text-sm">
                {timeline.map((t) => (
                  <div
                    key={t.key}
                    className="flex items-center justify-between rounded-md bg-muted/30 p-2"
                  >
                    <span className="text-muted-foreground">{t.label}</span>
                    <span>{formatDateTime(t.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 font-medium">Lịch sử xử lý</p>

              {historyLoading ? (
                <div className="text-sm text-muted-foreground">
                  Đang tải lịch sử xử lý...
                </div>
              ) : history.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Chưa có lịch sử xử lý.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.historyId}
                      className="rounded-lg border bg-muted/20 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{item.actionLabel}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(item.performedAt)}
                            {item.performedBy ? ` • ${item.performedBy}` : ""}
                          </p>
                        </div>

                        {(item.oldStatus || item.newStatus) && (
                          <div className="text-right text-xs text-muted-foreground">
                            <p>
                              {item.oldStatus || "--"} →{" "}
                              {item.newStatus || "--"}
                            </p>
                          </div>
                        )}
                      </div>

                      {item.note && (
                        <div className="mt-2 rounded-md bg-background p-2 text-sm whitespace-pre-wrap">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {droppedItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-destructive" />
                    <p className="font-medium text-destructive">
                      Mặt hàng bị HỦY
                    </p>
                  </div>

                  <div className="space-y-2">
                    {droppedItems.map((item, idx) => (
                      <div
                        key={(item as any).productId || (item as any).ingredientId || `drop-${idx}`}
                        className="rounded-md border border-destructive/20 bg-background p-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {(item as any).productName || (item as any).ingredientName || "Tên không xác định"}
                            </p>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                            <X size={12} />
                            Bị hủy
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-muted-foreground">Cần gửi</p>
                            <p className="font-medium">
                              {item.quantity} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-muted-foreground">Đã hủy</p>
                            <p className="font-medium text-destructive">
                              {item.droppedQuantity ??
                                (item.quantity ?? 0) -
                                  (item.forwardedQuantity ?? 0)}{" "}
                              {item.unit}
                            </p>
                          </div>
                        </div>

                        {item.dropReason ? (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            Lý do: {item.dropReason}
                          </p>
                        ) : null}

                        {item.hasForwardSnapshot === true &&
                        item.isForwardSnapshotConsistent === false ? (
                          <p className="mt-2 text-xs text-amber-600">
                            {item.forwardSnapshotWarning ||
                              "Dữ liệu forward cũ không còn đồng nhất, hệ thống đang dùng giá trị đã chuẩn hóa."}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {partialItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-600" />
                    <p className="font-medium text-yellow-900">
                      Mặt hàng được gửi một phần
                    </p>
                  </div>

                  <div className="space-y-2">
                    {partialItems.map((item, idx) => (
                      <div
                        key={(item as any).productId || (item as any).ingredientId || `partial-${idx}`}
                        className="rounded-md border border-yellow-200 bg-background p-3 text-sm"
                      >
binary
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {(item as any).productName || (item as any).ingredientName || "Tên không xác định"}
                            </p>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.sku}
                              </p>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            <PackageCheck size={12} />
                            Một phần
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-muted-foreground">Cần gửi</p>
                            <p className="font-medium">
                              {item.quantity} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-muted-foreground">Đã giao</p>
                            <p className="font-medium text-blue-600">
                              {item.forwardedQuantity ?? 0} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/50 p-2">
                            <p className="text-muted-foreground">
                              Thiếu / drop
                            </p>
                            <p className="font-medium text-destructive">
                              {item.droppedQuantity ??
                                (item.quantity ?? 0) -
                                  (item.forwardedQuantity ?? 0)}{" "}
                              {item.unit}
                            </p>
                          </div>
                        </div>

                        {item.dropReason ? (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            Lý do: {item.dropReason}
                          </p>
                        ) : null}

                        {item.hasForwardSnapshot === true &&
                        item.isForwardSnapshotConsistent === false ? (
                          <p className="mt-2 text-xs text-amber-600">
                            {item.forwardSnapshotWarning ||
                              "Dữ liệu forward cũ không còn đồng nhất, hệ thống đang dùng giá trị đã chuẩn hóa."}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium flex items-center gap-2">
                  <PackageCheck size={18} className="text-primary" />
                  Danh sách sản phẩm
                </p>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {order.items.length} SP
                </span>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => {
                  const hasItemCheckData =
                    typeof item.isSufficientInCentralKitchen === "boolean" ||
                    typeof item.availableInCentralKitchenQuantity === "number";

                  const requestedQty = item.quantity ?? 0;
                  const availableQty =
                    item.availableInCentralKitchenQuantity ?? 0;

                  const isEnough = hasItemCheckData
                    ? (item.isSufficientInCentralKitchen ??
                      availableQty >= requestedQty)
                    : true;

                  const isDropped =
                    item.isDroppedFromForward === true && (item.forwardedQuantity === 0 || item.forwardedQuantity == null);

                  const forwardedQty = item.forwardedQuantity ?? 0;
                  const droppedQty = item.droppedQuantity ?? 0;

                  const hasForwardResult =
                    item.hasForwardSnapshot === true ||
                    forwardedQty > 0 ||
                    droppedQty > 0 ||
                    item.isDroppedFromForward === true;

                  const isPartial =
                    forwardedQty > 0 && forwardedQty < requestedQty;

                  const isFull =
                    requestedQty > 0 && forwardedQty === requestedQty;

                  const itemState = hasForwardResult
                    ? isDropped
                      ? "DROPPED"
                      : isPartial
                        ? "PARTIAL"
                        : isFull
                          ? "FULL"
                          : isEnough
                            ? "SUFFICIENT"
                            : "INSUFFICIENT"
                    : isEnough
                      ? "SUFFICIENT"
                      : "INSUFFICIENT";

                  const itemStateClassName =
                    itemState === "DROPPED"
                      ? "border-red-200 bg-red-50/70"
                      : itemState === "PARTIAL"
                        ? "border-amber-200 bg-amber-50/70"
                        : itemState === "FULL"
                          ? "border-emerald-200 bg-emerald-50/70"
                          : itemState === "INSUFFICIENT"
                            ? "border-red-200 bg-red-50/70"
                            : "border-emerald-200 bg-emerald-50/70";

                  const itemStateBadgeClassName =
                    itemState === "DROPPED"
                      ? "bg-red-100 text-red-700"
                      : itemState === "PARTIAL"
                        ? "bg-amber-100 text-amber-700"
                        : itemState === "FULL"
                          ? "bg-emerald-100 text-emerald-700"
                          : itemState === "INSUFFICIENT"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700";

                  const itemStateLabel =
                    itemState === "DROPPED"
                      ? "Hủy"
                      : itemState === "PARTIAL"
                        ? "Một phần"
                        : itemState === "FULL"
                          ? "Đã gửi đủ"
                          : itemState === "INSUFFICIENT"
                            ? "Thiếu hàng"
                            : "Đầy đủ";

                  return (
                    <div
                      key={item.productId}
                      className={`rounded-xl border p-4 ${itemStateClassName}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.sku ? (
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.sku}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${itemStateBadgeClassName}`}
                          >
                            {itemStateLabel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 text-xs">
                        <div className="rounded-md bg-background p-2">
                          <p className="text-muted-foreground">
                            Số lượng đặt
                          </p>
                          <p className="font-medium">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>

                      {(isPartial || isDropped || isFull) && (
                        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                          <div className="rounded-md bg-background p-2">
                            <p className="text-muted-foreground">Cần gửi</p>
                            <p className="font-medium">
                              {item.quantity} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-background p-2">
                            <p className="text-muted-foreground">Đã forward</p>
                            <p className="font-medium">
                              {item.forwardedQuantity ?? 0} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-background p-2">
                            <p className="text-muted-foreground">Bị drop</p>
                            <p className="font-medium">
                              {item.droppedQuantity ?? 0} {item.unit}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.dropReason ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Lý do: {item.dropReason}
                        </p>
                      ) : null}

                      {item.hasForwardSnapshot === true &&
                      item.isForwardSnapshotConsistent === false ? (
                        <p className="mt-2 text-xs text-amber-600">
                          {item.forwardSnapshotWarning ||
                            "Dữ liệu forward cũ không còn đồng nhất, hệ thống đang dùng giá trị đã chuẩn hóa."}
                        </p>
                      ) : null}

                      {item.availableCentralKitchenBatches?.length ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Các lô khả dụng
                          </p>

                          {item.availableCentralKitchenBatches.map((batch) => (
                            <div
                              key={batch.batchId}
                              className="grid grid-cols-3 gap-3 rounded-md bg-background p-2 text-xs"
                            >
                              <div>
                                <p className="text-muted-foreground">Mã lô</p>
                                <p className="font-medium">{batch.batchCode}</p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">
                                  Số lượng
                                </p>
                                <p className="font-medium">
                                  {batch.quantity} {item.unit}
                                </p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">
                                  Hạn sử dụng
                                </p>
                                <p className="font-medium">
                                  {formatDate(batch.expiredAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>


            {order.ingredientItems && order.ingredientItems.length > 0 && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium flex items-center gap-2 text-emerald-700">
                    <FlaskConical size={18} />
                    Danh sách nguyên liệu
                  </p>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {order.ingredientItems.length} loại
                  </span>
                </div>

                <div className="overflow-hidden rounded-lg border bg-background text-sm">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-muted lg:table-header-group">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground w-10">#</th>
                        <th className="px-3 py-2 font-semibold text-muted-foreground min-w-[150px]">Nguyên liệu</th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground whitespace-nowrap">SL đặt</th>
                        <th className="px-3 py-2 text-center font-semibold text-muted-foreground whitespace-nowrap">SL giao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.ingredientItems.map((item, index) => {
                        const hasItemCheckData =
                          typeof item.isSufficientInCentralKitchen === "boolean" ||
                          typeof item.availableInCentralKitchenQuantity === "number";

                        const requestedQty = item.quantity ?? 0;
                        const availableQty = item.availableInCentralKitchenQuantity ?? 0;

                        const isEnough = hasItemCheckData
                          ? (item.isSufficientInCentralKitchen ?? availableQty >= requestedQty)
                          : true;

                        const isDropped = item.isDroppedFromForward === true && (item.forwardedQuantity === 0 || item.forwardedQuantity == null);
                        const forwardedQty = item.forwardedQuantity ?? 0;
                        const isPartial = !isDropped && forwardedQty > 0 && forwardedQty < requestedQty;
                        const isFull = requestedQty > 0 && forwardedQty === requestedQty;

                        const rowBgClass = isDropped
                          ? "bg-red-50 hover:bg-red-100/50"
                          : isPartial
                            ? "bg-amber-50 hover:bg-amber-100/50"
                            : isFull
                              ? "bg-emerald-50/50 hover:bg-emerald-50"
                              : "hover:bg-muted/50";

                        return (
                          <React.Fragment key={item.ingredientId || `ing-${index}`}>
                            <tr className={`${rowBgClass} transition-colors`}>
                              <td className="px-3 py-2 text-center align-top text-muted-foreground">
                                {index + 1}
                              </td>
                              <td className="px-3 py-2 align-top">
                                <p className={`font-medium ${isDropped ? "line-through text-muted-foreground" : ""}`}>
                                  {item.ingredientName || "Nguyên liệu không tên"}
                                </p>
                                <p className="text-[10px] text-muted-foreground italic">Đơn vị: {item.unit}</p>
                                {item.dropReason && (
                                  <p className="mt-1 text-[10px] text-destructive leading-relaxed font-normal bg-destructive/10 px-1.5 py-0.5 rounded inline-block max-w-xs break-words italic">
                                    Lý do: {item.dropReason}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center align-top font-medium text-muted-foreground">
                                {requestedQty}
                              </td>
                              <td className={`px-3 py-2 text-center align-top font-bold ${isDropped ? "text-red-700" : isPartial ? "text-amber-700" : "text-emerald-700"}`}>
                                {forwardedQty}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 border-t pt-4 text-sm font-semibold">
              <div className="flex justify-between">
                <span>Tổng số lượng đặt</span>
                <span>{order.totalQuantity || totalQty}</span>
              </div>

              {(order.forwardedTotalQuantity ?? 0) > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Tổng số lượng giao</span>
                  <span>{order.forwardedTotalQuantity}</span>
                </div>
              )}

              {(order.droppedTotalQuantity ?? 0) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Tổng số lượng hủy</span>
                  <span>{order.droppedTotalQuantity}</span>
                </div>
              )}
            </div>

            {order.cancelReason && (
              <div className="border-t pt-4 text-sm">
                <p className="mb-1 text-muted-foreground">Lý do hủy</p>
                <p className="font-medium text-destructive">
                  {order.cancelReason}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncomingOrderDetailDialog;
