import React from "react";
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

import type { IngredientBatch, ProductBatch } from "@/types/kitchen/inventoryBatch.types";
import { getBatchItemName } from "../helpers";

type BatchRow = IngredientBatch | ProductBatch;

type Props = {
  open: boolean;
  batch: BatchRow | null;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const DeleteBatchConfirmDialog: React.FC<Props> = ({
  open,
  batch,
  deleting = false,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lô hàng</AlertDialogTitle>
          <AlertDialogDescription>
            {batch
              ? `Bạn có chắc muốn xóa lô "${batch.batchCode}" của "${getBatchItemName(
                  batch,
                )}" không? Chỉ nên xóa khi lô đã hết số lượng.`
              : "Bạn có chắc muốn xóa lô hàng này không?"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={deleting}>
            {deleting ? "Đang xóa..." : "Xóa lô"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBatchConfirmDialog;