import React from "react";
import { Check } from "lucide-react";

const EmptyReceivingState: React.FC = () => {
  return (
    <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Check size={32} className="text-primary" />
      </div>

      <h3 className="mb-2 text-lg font-semibold">Không có đơn hàng chờ nhận</h3>
      <p className="text-muted-foreground">
        Tất cả đơn hàng đã được cửa hàng xác nhận.
      </p>
    </div>
  );
};

export default EmptyReceivingState;