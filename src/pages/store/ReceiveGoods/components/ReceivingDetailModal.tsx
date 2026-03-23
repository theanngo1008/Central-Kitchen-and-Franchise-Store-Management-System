import React from "react";
import { Loader2 } from "lucide-react";

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
  /**
   * ⭐ CRITICAL FIX
   * Do not render anything when modal is closing
   */
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chi tiết nhận hàng
            {detail?.deliveryCode ? ` - ${detail.deliveryCode}` : ""}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !detail ? (
          /**
           * ⭐ DO NOT show error when detail just disappeared
           */
          <div className="p-4 text-center text-muted-foreground">
            Đang đóng...
          </div>
        ) : (
          <div className="space-y-6">
            <ReceivingInfoGrid detail={detail} />
            <ReceivingItemsTable items={detail.items} />
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