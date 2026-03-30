import React, { useMemo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ReceivingDetail } from "@/types/store/receiving.types";

import ReceivingInfoGrid from "./ReceivingInfoGrid";
import ReceivingItemsTable from "./ReceivingItemsTable";
import ConfirmReceivingSection from "./ConfirmReceivingSection";

type Props = {
  open: boolean;
  onClose: () => void;
  detail?: ReceivingDetail;
  isLoading: boolean;
  isError: boolean;
  note: string;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  confirmLoading: boolean;
};

const ReceivingDetailModal: React.FC<Props> = ({
  open,
  onClose,
  detail,
  isLoading,
  isError,
  note,
  onNoteChange,
  onConfirm,
  confirmLoading,
}) => {
  if (!open) return null;

  const droppedCount = detail?.items.filter((i) => i.isDropped === true).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết nhận hàng
            {detail?.deliveryCode ? ` – ${detail.deliveryCode}` : ""}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !detail ? (
          <div className="p-4 text-center text-muted-foreground">Đang đóng...</div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/30 border rounded-xl p-3 flex flex-col justify-between">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tổng mặt hàng</p>
                <p className="text-xl font-bold">{detail.items.length} SP</p>
              </div>
              <div className="bg-muted/30 border rounded-xl p-3 flex flex-col justify-between">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Số lượng giao</p>
                <p className="text-xl font-bold text-primary">
                  {detail.items.reduce((s, i) => s + (i.deliveredQuantity ?? 0), 0)}
                </p>
              </div>
              <div className="bg-muted/30 border rounded-xl p-3 flex flex-col justify-between">
                <p className="text-[10px] text-destructive uppercase font-bold tracking-wider">Bị hủy</p>
                <p className={`text-xl font-bold ${(detail.items.reduce((s, i) => s + (i.droppedQuantity ?? 0), 0)) > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {detail.items.reduce((s, i) => s + (i.droppedQuantity ?? 0), 0)}
                </p>
              </div>
            </div>

            <ReceivingInfoGrid detail={detail} />
            <ReceivingItemsTable items={detail.items} status={detail.status} />
            <ConfirmReceivingSection
              status={detail.status}
              note={note}
              onNoteChange={onNoteChange}
              onClose={onClose}
              onConfirm={onConfirm}
              confirmLoading={confirmLoading}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceivingDetailModal;