import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  IngredientBatch,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";

type BatchRow = IngredientBatch | ProductBatch;

type Props = {
  open: boolean;
  batch: BatchRow | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    batchCode: string;
    reason?: string;
  }) => void | Promise<void>;
};

const RenameBatchCodeModal: React.FC<Props> = ({
  open,
  batch,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [batchCode, setBatchCode] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && batch) {
      setBatchCode(batch.batchCode ?? "");
      setReason("");
    }
  }, [open, batch]);

  const normalizedCurrentCode = batch?.batchCode?.trim() ?? "";
  const normalizedNewCode = batchCode.trim();

  const disabled =
    !batch ||
    !normalizedNewCode ||
    normalizedNewCode === normalizedCurrentCode ||
    submitting;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Đổi mã lô</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Mã lô hiện tại</p>
            <p className="font-medium">{batch?.batchCode || "-"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-batch-code">Mã lô mới</Label>
            <Input
              id="new-batch-code"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="Nhập mã lô mới"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rename-reason">Lý do</Label>
            <Input
              id="rename-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Chuẩn hóa mã lô"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button
              onClick={() =>
                onSubmit({
                  batchCode: normalizedNewCode,
                  reason: reason.trim() || undefined,
                })
              }
              disabled={disabled}
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RenameBatchCodeModal;
