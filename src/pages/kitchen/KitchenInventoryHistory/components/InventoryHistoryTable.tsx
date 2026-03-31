import React, { useMemo } from "react";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import type { KitchenInventoryHistoryMovement } from "@/types/kitchen/inventoryHistory.types";
import {
  formatDate,
  formatDateTime,
  formatDeltaQuantity,
  getDeltaTextClassName,
  getEventLabel,
} from "../helpers";
import type { InventoryHistoryTableRow } from "../types";

type Props = {
  data: KitchenInventoryHistoryMovement[];
  loading?: boolean;
  onViewLifecycle: (movement: KitchenInventoryHistoryMovement) => void;
};

const InventoryHistoryTable: React.FC<Props> = ({
  data,
  loading = false,
  onViewLifecycle,
}) => {
  const tableData = useMemo<InventoryHistoryTableRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        id: String(item.inventoryLedgerEntryId),
      })),
    [data],
  );

  const columns = [
    {
      key: "occurredAtUtc",
      label: "Thời điểm",
      render: (item: InventoryHistoryTableRow) => formatDateTime(item.occurredAtUtc),
    },
    {
      key: "itemName",
      label: "Mặt hàng",
      render: (item: InventoryHistoryTableRow) => (
        <div className="space-y-1">
          <p className="font-medium">{item.itemName}</p>
          <p className="text-xs text-muted-foreground">
            {item.itemType === "INGREDIENT" ? "Nguyên liệu" : "Sản phẩm"}
          </p>
        </div>
      ),
    },
    {
      key: "batchCode",
      label: "Mã lô",
      render: (item: InventoryHistoryTableRow) => (
        <div className="space-y-1">
          <p className="font-medium">{item.batchCode}</p>
          <p className="text-xs text-muted-foreground">Batch ID: {item.batchId}</p>
        </div>
      ),
    },
    {
      key: "eventType",
      label: "Sự kiện",
      render: (item: InventoryHistoryTableRow) => (
        <div className="space-y-1">
          <p>{getEventLabel(item.eventType)}</p>
          <p className="text-xs text-muted-foreground">{item.stockBucket}</p>
        </div>
      ),
    },
    {
      key: "deltaQuantity",
      label: "Biến động",
      render: (item: InventoryHistoryTableRow) => (
        <span className={getDeltaTextClassName(item)}>
          {formatDeltaQuantity(item)}
        </span>
      ),
    },
    {
      key: "expiredAt",
      label: "HSD",
      render: (item: InventoryHistoryTableRow) => formatDate(item.expiredAt),
    },
    {
      key: "meta",
      label: "Diễn giải",
      render: (item: InventoryHistoryTableRow) => (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {item.reason || item.deliveryCode || item.orderCode || "--"}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.actorDisplay || "--"}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: InventoryHistoryTableRow) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewLifecycle(item)}
        >
          <Eye size={16} className="mr-1" />
          Xem vòng đời
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Đang tải lịch sử tồn kho...
      </div>
    );
  }

  return <DataTable columns={columns} data={tableData} />;
};

export default InventoryHistoryTable;