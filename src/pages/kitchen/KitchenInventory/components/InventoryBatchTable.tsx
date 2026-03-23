import React, { useMemo } from "react";
import { AlertTriangle, PencilLine, Trash2 } from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";

import type {
  IngredientBatch,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";
import {
  canDeleteBatch,
  formatDate,
  getBatchItemName,
  getExpiryText,
  getExpiryTextClassName,
} from "../helpers";

type BatchRow = IngredientBatch | ProductBatch;

type TableRow = BatchRow & {
  id: string;
};

type Props = {
  data: BatchRow[];
  loading?: boolean;
  adjustingBatchId?: number | null;
  deletingBatchId?: number | null;
  onAdjust: (batch: BatchRow) => void;
  onDelete: (batch: BatchRow) => void;
};

const InventoryBatchTable: React.FC<Props> = ({
  data,
  loading = false,
  adjustingBatchId,
  deletingBatchId,
  onAdjust,
  onDelete,
}) => {
  const tableData = useMemo<TableRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        id: String(item.batchId),
      })),
    [data],
  );

  const columns = [
    {
      key: "batchCode",
      label: "Mã lô",
      render: (item: TableRow) => (
        <span className="font-medium">{item.batchCode}</span>
      ),
    },
    {
      key: "itemName",
      label: "Tên mặt hàng",
      render: (item: TableRow) => getBatchItemName(item),
    },
    {
      key: "quantity",
      label: "Số lượng",
      render: (item: TableRow) => `${item.quantity} ${item.unit}`,
    },
    {
      key: "createdAt",
      label: "Ngày tạo lô",
      render: (item: TableRow) => formatDate(item.createdAt),
    },
    {
      key: "expiredAt",
      label: "Hạn sử dụng",
      render: (item: TableRow) => {
        const expiryText = getExpiryText(item.expiredAt);
        const expiryClass = getExpiryTextClassName(item.expiredAt);
        const isDanger =
          expiryClass.includes("destructive") || expiryClass.includes("amber");

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={isDanger ? "font-medium" : ""}>
                {formatDate(item.expiredAt)}
              </span>
              {isDanger ? <AlertTriangle size={14} className={expiryClass} /> : null}
            </div>
            <p className={`text-xs ${expiryClass}`}>{expiryText}</p>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: TableRow) => {
        const isAdjusting = adjustingBatchId === item.batchId;
        const isDeleting = deletingBatchId === item.batchId;
        const deleteDisabled = !canDeleteBatch(item.quantity) || isDeleting;

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(item)}
              disabled={isAdjusting || isDeleting}
            >
              <PencilLine size={16} className="mr-1" />
              {isAdjusting ? "Đang xử lý..." : "Điều chỉnh"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(item)}
              disabled={deleteDisabled}
              title={
                deleteDisabled && item.quantity > 0
                  ? "Chỉ được xóa khi số lượng bằng 0"
                  : undefined
              }
            >
              <Trash2 size={16} className="mr-1" />
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        Đang tải dữ liệu tồn kho...
      </div>
    );
  }

  return <DataTable columns={columns} data={tableData} />;
};

export default InventoryBatchTable;