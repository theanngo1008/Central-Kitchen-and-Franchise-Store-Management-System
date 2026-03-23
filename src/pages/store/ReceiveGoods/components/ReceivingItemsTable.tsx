import React from "react";

import type { ReceivingDetailItem } from "@/types/store/receiving.types";

type Props = {
  items: ReceivingDetailItem[];
};

const ReceivingItemsTable: React.FC<Props> = ({ items }) => {
  return (
    <div>
      <h4 className="mb-3 font-semibold">Danh sách sản phẩm / nguyên liệu</h4>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Tên mặt hàng</th>
              <th className="px-4 py-2 text-left font-medium">Phân loại</th>
              <th className="px-4 py-2 text-center font-medium">Số lượng giao</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={`${item.itemType}-${item.itemId}`}
                className="border-b hover:bg-muted/10 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{item.itemName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.itemType === "PRODUCT" ? "Thành phẩm" : "Nguyên liệu"}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.deliveredQuantity}{" "}
                  <span className="text-muted-foreground">{item.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivingItemsTable;