import React, { useMemo } from "react";
import { Eye, Hand, Send } from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";

import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import {
  canForwardIncomingOrder,
  canProcessIncomingOrder,
  formatDate,
  formatDateTime,
  getOrderDisplayCode,
  getOrderItemCount,
  getOrderTotalQuantity,
  hasIncomingOrderInventoryCheckData,
  hasSufficientCentralKitchenStock,
} from "../helpers";

type Props = {
  orders: IncomingOrder[];
  loading?: boolean;
  lockingOrderId?: number | null;
  receivingOrderId?: number | null;
  forwardingOrderId?: number | null;
  onViewDetail: (order: IncomingOrder) => void;
  onReceiveOrder?: (order: IncomingOrder) => void;
  onForwardOrder?: (order: IncomingOrder, note?: string) => void;
};

type IncomingOrderRow = IncomingOrder & {
  id: string;
};

const IncomingOrdersTable: React.FC<Props> = ({
  orders,
  loading = false,
  lockingOrderId,
  receivingOrderId,
  forwardingOrderId,
  onViewDetail,
  onReceiveOrder,
  onForwardOrder,
}) => {
  const tableData = useMemo<IncomingOrderRow[]>(
    () =>
      orders.map((order) => ({
        ...order,
        id: String(order.storeOrderId),
      })),
    [orders],
  );

  const columns = [
    {
      key: "storeOrderId",
      label: "Mã đơn",
      render: (order: IncomingOrderRow) => (
        <span className="font-medium">{getOrderDisplayCode(order)}</span>
      ),
    },
    {
      key: "franchiseName",
      label: "Cửa hàng",
      render: (order: IncomingOrderRow) => order.franchiseName,
    },
    {
      key: "orderDate",
      label: "Ngày đặt",
      render: (order: IncomingOrderRow) => formatDate(order.orderDate),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (order: IncomingOrderRow) => (
        <StatusBadge status={order.status} />
      ),
    },
    {
      key: "itemCount",
      label: "Số mặt hàng",
      render: (order: IncomingOrderRow) => getOrderItemCount(order),
    },
    {
      key: "totalQuantity",
      label: "Tổng số lượng",
      render: (order: IncomingOrderRow) => getOrderTotalQuantity(order),
    },
    {
      key: "submittedAt",
      label: "Thời gian gửi",
      render: (order: IncomingOrderRow) => formatDateTime(order.submittedAt),
    },
    {
      key: "lockedAt",
      label: "Thời gian khóa",
      render: (order: IncomingOrderRow) => formatDateTime(order.lockedAt),
    },
    {
      key: "receivedAt",
      label: "Thời gian tiếp nhận",
      render: (order: IncomingOrderRow) => formatDateTime(order.receivedAt),
    },
    {
      key: "createdAt",
      label: "Thời gian tạo",
      render: (order: IncomingOrderRow) => formatDateTime(order.createdAt),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (order: IncomingOrderRow) => {
        const canReceive = canProcessIncomingOrder(order);
        const canForward = canForwardIncomingOrder(order);

        const hasInventoryData = hasIncomingOrderInventoryCheckData(order);
        const hasEnoughStock = hasSufficientCentralKitchenStock(order);

        const isLocking = lockingOrderId === order.storeOrderId;
        const isReceiving = receivingOrderId === order.storeOrderId;
        const isForwarding = forwardingOrderId === order.storeOrderId;
        const isReceiveFlowLoading = isLocking || isReceiving;

        const disableForwardButton =
          isForwarding ||
          isReceiveFlowLoading ||
          (hasInventoryData && !hasEnoughStock);

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetail(order)}
            >
              <Eye size={16} className="mr-1" />
              Xem
            </Button>

            {onReceiveOrder && canReceive && (
              <Button
                size="sm"
                variant="outline"
                disabled={isReceiveFlowLoading || isForwarding}
                onClick={() => onReceiveOrder(order)}
              >
                <Hand size={16} className="mr-1" />
                {isReceiveFlowLoading ? "Đang tiếp nhận..." : "Tiếp nhận"}
              </Button>
            )}

            {onForwardOrder && canForward && (
              <Button
                size="sm"
                variant="outline"
                disabled={disableForwardButton}
                onClick={() => onForwardOrder(order, "")}
              >
                <Send size={16} className="mr-1" />
                {isForwarding ? "Đang chuyển..." : "Chuyển Cung ứng"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  return <DataTable columns={columns} data={tableData} />;
};

export default IncomingOrdersTable;