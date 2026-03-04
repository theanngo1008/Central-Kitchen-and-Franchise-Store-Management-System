import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

const OrderNote: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
      <Textarea
        id="note"
        placeholder="Yêu cầu đặc biệt..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default OrderNote;