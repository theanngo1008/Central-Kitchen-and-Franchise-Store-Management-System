import React from "react";

import { StatusBadge } from "@/components/ui/StatusBadge";

import type { ReceivingDetail } from "@/types/store/receiving.types";

type Props = {
  detail: ReceivingDetail;
};

const ReceivingInfoGrid: React.FC<Props> = ({ detail }) => {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/20 p-4 text-sm">
      <div>
        <p className="text-muted-foreground">Bếp cung cấp</p>
        <p className="font-medium">{detail.centralKitchenName}</p>
      </div>

      <div>
        <p className="text-muted-foreground">Ngày giao kế hoạch</p>
        <p className="font-medium">{detail.planDate}</p>
      </div>

      <div>
        <p className="text-muted-foreground">Trạng thái</p>
        <StatusBadge status={detail.status} />
      </div>

      <div>
        <p className="text-muted-foreground">Mã đơn liên kết</p>
        <p className="font-medium">{detail.orderCode || "Không có"}</p>
      </div>

      <div>
        <p className="text-muted-foreground">Thời điểm giao hàng</p>
        <p className="font-medium">{detail.deliveryDate || "Chưa có"}</p>
      </div>

      <div>
        <p className="text-muted-foreground">Ghi chú</p>
        <p className="font-medium">{detail.note || "Không có"}</p>
      </div>
    </div>
  );
};

export default ReceivingInfoGrid;