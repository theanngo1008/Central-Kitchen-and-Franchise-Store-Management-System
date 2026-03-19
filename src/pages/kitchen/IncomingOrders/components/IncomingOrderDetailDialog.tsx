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
  getOrderDisplayCode,
  getOrderTimeline,
  getOrderTotalQuantity,
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
  "LOCKED",
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

  if (!open) return null;

  const canEditProcessingNote = order
    ? ALLOWED_NOTE_STATUSES.has(order.status)
    : false;

  const canForwardToSupply = order
    ? order.status === "RECEIVED_BY_KITCHEN"
    : false;

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
              ? `Order ${getOrderDisplayCode(order)}`
              : "Loading order detail..."}
          </DialogTitle>
        </DialogHeader>

        {loading || !order ? (
          <div className="py-6 text-sm text-muted-foreground">
            Loading order detail...
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Store</p>
                <p className="font-medium">{order.franchiseName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <StatusBadge status={order.status} />
              </div>

              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{formatDateTime(order.createdAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p>{formatDateTime(order.submittedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Locked</p>
                <p>{formatDateTime(order.lockedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Received At</p>
                <p>{formatDateTime(order.receivedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Received By</p>
                <p>{order.receivedBy || "--"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Forwarded At</p>
                <p>{formatDateTime(order.forwardedAt)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Forwarded By</p>
                <p>{order.forwardedBy || "--"}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Processing Note</p>
                {order.processingNoteUpdatedAt && (
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDateTime(order.processingNoteUpdatedAt)}
                    {order.processingNoteUpdatedBy
                      ? ` by ${order.processingNoteUpdatedBy}`
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
                      ? "Có thể cập nhật note khi đơn ở trạng thái Locked, Received by Kitchen hoặc Forwarded to Supply."
                      : "Không thể cập nhật note ở trạng thái hiện tại."}
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
                    {savingProcessingNote ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>

            {shouldShowForwardSection && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">Forward to Supply</p>
                  {order.forwardedAt && (
                    <span className="text-xs text-muted-foreground">
                      Forwarded {formatDateTime(order.forwardedAt)}
                      {order.forwardedBy ? ` by ${order.forwardedBy}` : ""}
                    </span>
                  )}
                </div>

                {canForwardToSupply ? (
                  <div className="space-y-3">
                    <Textarea
                      value={forwardNoteValue}
                      onChange={(e) => setForwardNoteValue(e.target.value)}
                      placeholder="Nhập ghi chú khi chuyển đơn sang Supply..."
                      disabled={forwardingToSupply}
                      rows={3}
                    />

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Chỉ có thể chuyển sang Supply khi đơn ở trạng thái
                        Received by Kitchen.
                      </p>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleForward}
                        disabled={forwardingToSupply}
                      >
                        <Send size={16} className="mr-2" />
                        {forwardingToSupply
                          ? "Forwarding..."
                          : "Forward to Supply"}
                      </Button>
                    </div>
                  </div>
                ) : order.status === "FORWARDED_TO_SUPPLY" ? (
                  <div className="rounded-md bg-muted/30 p-3 text-sm">
                    <p className="text-muted-foreground">
                      Đơn đã được chuyển sang Supply.
                    </p>
                    {order.forwardNote?.trim() ? (
                      <div className="mt-2">
                        <p className="mb-1 text-muted-foreground">
                          Saved Forward Note
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
              <p className="mb-3 font-medium">Timeline</p>

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
              <p className="mb-3 font-medium">Processing History</p>

              {historyLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading history...
                </div>
              ) : history.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No history records yet.
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
              <p className="mb-3 font-medium">Order Items</p>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3 text-sm"
                  >
                    <span className="font-medium">{item.productName}</span>
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4 font-semibold">
              <span>Total Quantity</span>
              <span>{totalQty}</span>
            </div>

            {order.cancelReason && (
              <div className="border-t pt-4 text-sm">
                <p className="mb-1 text-muted-foreground">Cancel Reason</p>
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