import React from "react";
import { formatCurrency } from "@/utils";

type Props = {
  total: number;
};

const OrderSummary: React.FC<Props> = ({ total }) => {
  return (
    <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t mt-2">
      <span>Tổng cộng</span>
      <span className="text-primary">{formatCurrency(total)}</span>
    </div>
  );
};

export default OrderSummary;