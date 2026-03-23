import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  IngredientBatch,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";
import { formatDate } from "../helpers";

type BatchRow = IngredientBatch | ProductBatch;

type Props = {
  open: boolean;
  loading?: boolean;
  batch: BatchRow | null;
  onClose: () => void;
};

const BatchDetailDialog: React.FC<Props> = ({
  open,
  loading = false,
  batch,
  onClose,
}) => {
  const itemName = batch
    ? "ingredientName" in batch
      ? batch.ingredientName
      : batch.productName
    : "";

  const itemType = batch
    ? "ingredientId" in batch
      ? "Nguyên liệu"
      : "Sản phẩm"
    : "";

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết lô hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-muted-foreground">
            Đang tải chi tiết...
          </div>
        ) : !batch ? (
          <div className="py-6 text-sm text-muted-foreground">
            Không có dữ liệu lô hàng.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Loại</p>
              <p className="font-medium">{itemType}</p>
            </div>

            <div>
              <p className="text-muted-foreground">ID lô</p>
              <p className="font-medium">{batch.batchId}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Tên mặt hàng</p>
              <p className="font-medium">{itemName}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Mã lô</p>
              <p className="font-medium">{batch.batchCode}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Số lượng</p>
              <p className="font-medium">
                {batch.quantity} {batch.unit}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Bếp trung tâm</p>
              <p className="font-medium">{batch.centralKitchenId}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Ngày tạo lô</p>
              <p className="font-medium">{formatDate(batch.createdAt)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Hạn sử dụng</p>
              <p className="font-medium">{formatDate(batch.expiredAt)}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BatchDetailDialog;