import React from "react";
import type { KitchenInventoryBatchLifecycle } from "@/types/kitchen/inventoryHistory.types";
import {
  formatDate,
  getLifecycleCurrentStateText,
} from "../helpers";

type Props = {
  lifecycle: KitchenInventoryBatchLifecycle;
};

const BatchLifecycleHeader: React.FC<Props> = ({ lifecycle }) => {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Tên mặt hàng</p>
          <p className="font-medium">{lifecycle.itemName}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Loại</p>
          <p className="font-medium">
            {lifecycle.itemType === "INGREDIENT" ? "Nguyên liệu" : "Sản phẩm"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Batch ID</p>
          <p className="font-medium">{lifecycle.batchId}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Mã lô hiện tại</p>
          <p className="font-medium">{lifecycle.currentBatchCode || "--"}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Ngày tạo lô</p>
          <p className="font-medium">{formatDate(lifecycle.batchCreatedAtUtc)}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Hạn sử dụng</p>
          <p className="font-medium">{formatDate(lifecycle.expiredAt)}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Số lượng hiện tại</p>
          <p className="font-medium">
            {lifecycle.currentQuantity ?? "--"} {lifecycle.itemUnit}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Bucket hiện tại</p>
          <p className="font-medium">{lifecycle.currentBucket || "--"}</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
        {getLifecycleCurrentStateText(lifecycle)}
      </div>
    </div>
  );
};

export default BatchLifecycleHeader;