import React, { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  IngredientBatch,
  InventoryAdjustmentType,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";
import { INVENTORY_ADJUSTMENT_TYPE_OPTIONS } from "../helpers";

type BatchRow = IngredientBatch | ProductBatch;

type Props = {
  open: boolean;
  batch: BatchRow | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    batchId: number;
    type: InventoryAdjustmentType;
    deltaQuantity: number;
    reason: string;
    reference?: string;
  }) => void | Promise<void>;
};

const AdjustBatchModal: React.FC<Props> = ({
  open,
  batch,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<InventoryAdjustmentType>("ADJUST");
  const [deltaQuantity, setDeltaQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!open) return;
    setType("ADJUST");
    setDeltaQuantity("");
    setReason("");
    setReference("");
  }, [open, batch]);

  const quantityNumber = useMemo(() => Number(deltaQuantity), [deltaQuantity]);

  const isInvalidQuantity =
    !deltaQuantity.trim() ||
    Number.isNaN(quantityNumber) ||
    quantityNumber <= 0 ||
    !Number.isInteger(quantityNumber);

  const isWasteOverQuantity =
    !!batch &&
    type === "WASTE" &&
    !Number.isNaN(quantityNumber) &&
    quantityNumber > batch.quantity;

  const isSubmitDisabled =
    submitting ||
    !batch ||
    isInvalidQuantity ||
    !reason.trim() ||
    isWasteOverQuantity;

  const handleSubmit = async () => {
    if (!batch || isSubmitDisabled) return;

    await onSubmit({
      batchId: batch.batchId,
      type,
      deltaQuantity: quantityNumber,
      reason: reason.trim(),
      reference: reference.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Điều chỉnh lô hàng</DialogTitle>
        </DialogHeader>

        {!batch ? (
          <div className="py-6 text-sm text-muted-foreground">
            Không có dữ liệu lô cần điều chỉnh.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="font-medium">{batch.batchCode}</p>
              <p className="text-muted-foreground">
                Số lượng hiện tại: {batch.quantity} {batch.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Loại nghiệp vụ</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value as InventoryAdjustmentType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nghiệp vụ" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_ADJUSTMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Số lượng điều chỉnh</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={deltaQuantity}
                onChange={(e) => setDeltaQuantity(e.target.value)}
                placeholder="Nhập số lượng"
              />
              {isInvalidQuantity ? (
                <p className="text-sm text-destructive">
                  Số lượng phải là số nguyên dương.
                </p>
              ) : null}
              {isWasteOverQuantity ? (
                <p className="text-sm text-destructive">
                  Số lượng hao hụt không được vượt quá tồn hiện tại.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Lý do điều chỉnh</Label>
              <Textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do điều chỉnh..."
              />
            </div>

            <div className="space-y-2">
              <Label>Tham chiếu</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ví dụ: kiểm kê cuối ngày"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
                {submitting ? "Đang lưu..." : "Lưu điều chỉnh"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdjustBatchModal;
