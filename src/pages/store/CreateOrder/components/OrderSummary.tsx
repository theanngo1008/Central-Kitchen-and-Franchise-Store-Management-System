import React from "react";

type Props = {
  total: number;
};

const OrderSummary: React.FC<Props> = ({ total }) => {
  const text = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(total);

  return (
    <div className="flex items-center justify-between text-lg font-semibold pt-2">
      <span>Tổng cộng</span>
      <span>{text}</span>
    </div>
  );
};

export default OrderSummary;