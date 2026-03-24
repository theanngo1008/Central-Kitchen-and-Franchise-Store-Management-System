import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  IngredientBatch,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";
import { getBatchItemName } from "../helpers";

type BatchRow = IngredientBatch | ProductBatch;

type Props = {
  open: boolean;
  batch: BatchRow | null;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
};

const DeleteBatchConfirmDialog: React.FC<Props> = ({
  open,
  batch,
  deleting = false,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const cannotDelete = !!batch && batch.quantity > 0;
  const disabled = deleting || cannotDelete || !reason.trim();

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lô hàng</AlertDialogTitle>
          <AlertDialogDescription>
            {!batch
              ? "Bạn có chắc muốn xóa lô hàng này không?"
              : cannotDelete
                ? `Lô "${batch.batchCode}" của "${getBatchItemName(
                    batch,
                  )}" vẫn còn ${batch.quantity} ${batch.unit}. Chỉ được xóa khi số lượng bằng 0.`
                : `Bạn có chắc muốn xóa lô "${batch.batchCode}" của "${getBatchItemName(
                    batch,
                  )}" không?`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!cannotDelete ? (
          <div className="space-y-2">
            <Label htmlFor="delete-reason">Lý do xóa</Label>
            <Input
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xóa lô"
              disabled={deleting}
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (disabled) {
                e.preventDefault();
                return;
              }
              void onConfirm(reason.trim());
            }}
            disabled={disabled}
          >
            {deleting ? "Đang xóa..." : "Xóa lô"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBatchConfirmDialog;