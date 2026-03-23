import React from "react";
import { PackageOpen } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

const EmptyInventoryState: React.FC<Props> = ({
  title = "Chưa có dữ liệu tồn kho",
  description = "Hiện chưa có lô hàng nào phù hợp với điều kiện đang chọn.",
}) => {
  return (
    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <PackageOpen size={22} className="text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyInventoryState;