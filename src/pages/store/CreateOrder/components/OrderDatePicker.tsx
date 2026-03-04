import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const OrderDatePicker: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="orderDate">Ngày giao hàng</Label>
      <Input
        id="orderDate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
};

export default OrderDatePicker;