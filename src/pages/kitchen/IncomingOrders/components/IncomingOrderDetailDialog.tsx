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
import { Save, Send } from "lucide-react";

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

  if (!open) return null;

  const canEditProcessingNote = order
    ? ALLOWED_NOTE_STATUSES.has(order.status)
    : false;

  const canForwardByStatus = order
    ? order.status === "RECEIVED_BY_KITCHEN"
    : false;

  const canForwardToSupply = canForwardByStatus && hasEnoughStock;

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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cửa hàng</p>
                <p className="font-medium">{order.franchiseName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <p className="text-muted-foreground">Ngày đặt hàng</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
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
                <p className="text-muted-foreground">Thời gian chuyển Cung ứng</p>
                <p>{formatDateTime(order.forwardedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Người chuyển Cung ứng</p>
                <p>{order.forwardedBy || "--"}</p>
              </div>
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
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Chuyển sang Cung ứng</p>
                  {order.forwardedAt && (
                    <span className="text-xs text-muted-foreground">
                      Đã chuyển lúc {formatDateTime(order.forwardedAt)}
                      {order.forwardedBy ? ` bởi ${order.forwardedBy}` : ""}
                    </span>
                  )}
                </div>

                {canForwardByStatus ? (
                  <div className="space-y-3">
                    <Textarea
                      value={forwardNoteValue}
                      onChange={(e) => setForwardNoteValue(e.target.value)}
                      placeholder="Nhập ghi chú khi chuyển đơn sang Cung ứng..."
                      disabled={forwardingToSupply}
                      rows={3}
                    />

                    {hasInventoryCheckData && !hasEnoughStock && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                        <p className="font-medium text-destructive">
                          Không thể chuyển đơn sang Bộ phận Cung ứng vì tồn kho tại
                          Bếp Trung Tâm không đủ.
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Vui lòng kiểm tra lại tồn kho đối với các mặt hàng đang
                          thiếu trước khi chuyển đơn.
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
                          ? "Không thể chuyển sang Cung ứng khi còn mặt hàng thiếu tồn kho tại Bếp Trung Tâm."
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

            <div className="border-t pt-4">
              <p className="mb-3 font-medium">Danh sách mặt hàng</p>

              <div className="space-y-3">
                {order.items.map((item) => {
                  const hasItemCheckData =
                    typeof item.isSufficientInCentralKitchen === "boolean" ||
                    typeof item.availableInCentralKitchenQuantity === "number";

                  const availableQty = item.availableInCentralKitchenQuantity ?? 0;
                  const isEnough = hasItemCheckData
                    ? (item.isSufficientInCentralKitchen ??
                        availableQty >= item.quantity)
                    : true;

                  return (
                    <div
                      key={item.productId}
                      className="rounded-lg border bg-muted/30 p-3 text-sm"
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
                          <p className="font-medium">
                            {item.quantity} {item.unit}
                          </p>
                          {hasItemCheckData ? (
                            <p
                              className={`text-xs ${
                                isEnough
                                  ? "text-green-600"
                                  : "text-destructive"
                              }`}
                            >
                              {isEnough ? "Đủ tồn kho" : "Thiếu tồn kho"}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {hasItemCheckData && (
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-md bg-background p-2">
                            <p className="text-muted-foreground">Số lượng đặt</p>
                            <p className="font-medium">
                              {item.quantity} {item.unit}
                            </p>
                          </div>

                          <div className="rounded-md bg-background p-2">
                            <p className="text-muted-foreground">
                              Tồn kho tại Bếp Trung Tâm
                            </p>
                            <p
                              className={`font-medium ${
                                isEnough
                                  ? "text-green-600"
                                  : "text-destructive"
                              }`}
                            >
                              {availableQty} {item.unit}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.availableCentralKitchenBatches?.length ? (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Các lô còn tồn
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

            <div className="flex items-center justify-between border-t pt-4 font-semibold">
              <span>Tổng số lượng</span>
              <span>{totalQty}</span>
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