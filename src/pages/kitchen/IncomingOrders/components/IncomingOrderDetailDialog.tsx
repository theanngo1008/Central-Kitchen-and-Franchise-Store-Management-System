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
import { Save } from "lucide-react";

import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
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
    note: string
  ) => Promise<void> | void;
  savingProcessingNote?: boolean;
  loading?: boolean;
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
  savingProcessingNote = false,
  loading = false,
}) => {
  const [noteValue, setNoteValue] = useState("");

  useEffect(() => {
    setNoteValue(order?.processingNote ?? "");
  }, [order?.storeOrderId, order?.processingNote, open]);

  const timeline = useMemo(
    () => (order ? getOrderTimeline(order) : []),
    [order]
  );
  const totalQty = useMemo(
    () => (order ? getOrderTotalQuantity(order) : 0),
    [order]
  );

  if (!open) return null;

  const canEditProcessingNote = order
    ? ALLOWED_NOTE_STATUSES.has(order.status)
    : false;

  const isNoteChanged = order
    ? (noteValue ?? "").trim() !== (order.processingNote ?? "").trim()
    : false;

  const handleSave = async () => {
    if (!order || !onSaveProcessingNote || !canEditProcessingNote) return;
    await onSaveProcessingNote(order, noteValue.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
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