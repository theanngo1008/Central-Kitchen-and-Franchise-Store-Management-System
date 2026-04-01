import React from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SupplyProcessedOrderResponse } from "@/types/supply";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, User, Package } from "lucide-react";

interface HistoryOrderTableProps {
  orders: SupplyProcessedOrderResponse[];
  onOrderClick: (orderId: number, storeId: number, storeName: string) => void;
}

const HistoryOrderTable: React.FC<HistoryOrderTableProps> = ({
  orders,
  onOrderClick,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
        <Package className="w-12 h-12 mb-4 opacity-20" />
        <p>Không có đơn hàng nào trong lịch sử.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Mã đơn</TableHead>
            <TableHead className="font-semibold">Cửa hàng</TableHead>
            <TableHead className="font-semibold">Ngày yêu cầu</TableHead>
            <TableHead className="font-semibold text-center">Số lượng</TableHead>
            <TableHead className="font-semibold">Trạng thái cuối</TableHead>
            <TableHead className="font-semibold">Ngày hoàn tất</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.storeOrderId}
              className="cursor-pointer hover:bg-muted/30 transition-colors group"
              onClick={() => onOrderClick(order.storeOrderId, order.storeId, order.storeName)}
            >
              <TableCell className="font-bold text-primary">
                {order.orderCode}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm">{order.storeName}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {order.requestedDeliveryDate}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {order.totalItems} món ({order.totalQuantity})
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(order.endedAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <ChevronRight size={18} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryOrderTable;
