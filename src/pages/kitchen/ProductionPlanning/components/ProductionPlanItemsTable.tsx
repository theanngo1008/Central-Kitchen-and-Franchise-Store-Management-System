import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ProductionPlanItem } from "@/types/kitchen/productionPlan.types";

type Props = {
  items: ProductionPlanItem[];
};

const ProductionPlanItemsTable: React.FC<Props> = ({ items }) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-xl border bg-background">
      <div className="border-b p-4">
        <h3 className="text-sm font-semibold">Production Items</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Danh sách thành phẩm BE đã tổng hợp từ các LOCKED orders
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="w-[120px]">Unit</TableHead>
            <TableHead className="w-[140px] text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No production items found.
              </TableCell>
            </TableRow>
          ) : (
            <>
              {items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productId}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.quantity}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totalQuantity}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductionPlanItemsTable;