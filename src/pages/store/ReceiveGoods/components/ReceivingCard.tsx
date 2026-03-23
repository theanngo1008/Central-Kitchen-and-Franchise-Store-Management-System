import React from "react";
import { ClipboardList, Package } from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";

import type { PendingReceivingItem } from "@/types/store/receiving.types";

type Props = {
  receiving: PendingReceivingItem;
  onOpen: () => void;
};

const ReceivingCard: React.FC<Props> = ({ receiving, onOpen }) => {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-lg font-semibold">{receiving.deliveryCode}</span>
          {receiving.orderCode && (
            <p className="mt-1 text-xs text-muted-foreground">
              Order: {receiving.orderCode}
            </p>
          )}
        </div>

        <StatusBadge status={receiving.status} />
      </div>

      <div className="mb-6 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded bg-muted/30 p-2">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Package size={14} />
            Tổng món
          </span>
          <span className="font-medium">
            {receiving.totalItems} (SL: {receiving.totalQuantity})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Ngày giao kế hoạch</span>
          <span>{receiving.planDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <ClipboardList size={14} />
            Bếp cung cấp
          </span>
          <span
            className="max-w-[150px] truncate text-right"
            title={receiving.centralKitchenName}
          >
            {receiving.centralKitchenName}
          </span>
        </div>
      </div>

      <Button className="w-full" onClick={onOpen}>
        Chi tiết & Nhận hàng
      </Button>
    </div>
  );
};

export default ReceivingCard;