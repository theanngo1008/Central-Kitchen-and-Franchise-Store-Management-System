import React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { ReceivingStatus } from "@/types/store/receiving.types";

type Props = {
  status: ReceivingStatus | string;
  note: string;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirmLoading: boolean;
};

const ConfirmReceivingSection: React.FC<Props> = ({
  status,
  note,
  onNoteChange,
  onClose,
  onConfirm,
  confirmLoading,
}) => {
  const isAlreadyReceived = status === "RECEIVED_BY_STORE";

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <Label>Ghi chú nhận hàng</Label>
        <Textarea
          placeholder="VD: Đã nhận đủ hàng, tình trạng tốt..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />

        {isAlreadyReceived && (
          <p className="text-sm text-muted-foreground">
            Đơn hàng này đã được cửa hàng xác nhận nhận hàng.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={confirmLoading}>
          Đóng
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isAlreadyReceived || confirmLoading}
        >
          {confirmLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isAlreadyReceived ? "Đã xác nhận nhận hàng" : "Xác nhận đã nhận hàng"}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmReceivingSection;