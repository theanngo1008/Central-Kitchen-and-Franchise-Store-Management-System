import React from "react";
import { AlertTriangle, Boxes, Package, Scale } from "lucide-react";

type Props = {
  totalBatches: number;
  totalQuantity: number;
  expiringSoonCount: number;
  totalItems: number;
};

const InventorySummaryCards: React.FC<Props> = ({
  totalBatches,
  totalQuantity,
  expiringSoonCount,
  totalItems,
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          <AlertTriangle size={16} />
          <span className="text-sm">Sắp hết hạn trong 7 ngày</span>
        </div>
        <p className="text-2xl font-semibold text-destructive">{expiringSoonCount}</p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          <Boxes size={16} />
          <span className="text-sm">Tổng số lô</span>
        </div>
        <p className="text-2xl font-semibold">{totalBatches}</p>
      </div>

      

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          <Package size={16} />
          <span className="text-sm">Số mặt hàng</span>
        </div>
        <p className="text-2xl font-semibold">{totalItems}</p>
      </div>
    </div>
  );
};

export default InventorySummaryCards;