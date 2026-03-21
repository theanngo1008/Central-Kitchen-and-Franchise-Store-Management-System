import React, { useMemo } from "react";
import { Eye, Hand, Lock, Send } from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";

import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import {
  canForwardIncomingOrder,
  canLockIncomingOrder,
  canProcessIncomingOrder,
  formatDate,
  formatDateTime,
  getOrderDisplayCode,
  getOrderItemCount,
  getOrderTotalQuantity,
} from "../helpers";

type Props = {
  orders: IncomingOrder[];
  loading?: boolean;
  lockingOrderId?: number | null;
  receivingOrderId?: number | null;
  forwardingOrderId?: number | null;
  onViewDetail: (order: IncomingOrder) => void;
  onLockOrder?: (order: IncomingOrder) => void;
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
  onLockOrder,
  onReceiveOrder,
  onForwardOrder,
}) => {
  const tableData = useMemo<IncomingOrderRow[]>(
    () =>
      orders.map((order) => ({
        ...order,
        id: String(order.storeOrderId),
      })),
    [orders]
  );

  const columns = [
    {
      key: "storeOrderId",
      label: "Order Code",
      render: (order: IncomingOrderRow) => (
        <span className="font-medium">{getOrderDisplayCode(order)}</span>
      ),
    },
    {
      key: "franchiseName",
      label: "Store",
      render: (order: IncomingOrderRow) => order.franchiseName,
    },
    {
      key: "orderDate",
      label: "Order Date",
      render: (order: IncomingOrderRow) => formatDate(order.orderDate),
    },
    {
      key: "status",
      label: "Status",
      render: (order: IncomingOrderRow) => (
        <StatusBadge status={order.status} />
      ),
    },
    {
      key: "itemCount",
      label: "Items",
      render: (order: IncomingOrderRow) => getOrderItemCount(order),
    },
    {
      key: "totalQuantity",
      label: "Total Qty",
      render: (order: IncomingOrderRow) => getOrderTotalQuantity(order),
    },
    {
      key: "submittedAt",
      label: "Submitted At",
      render: (order: IncomingOrderRow) => formatDateTime(order.submittedAt),
    },
    {
      key: "lockedAt",
      label: "Locked At",
      render: (order: IncomingOrderRow) => formatDateTime(order.lockedAt),
    },
    {
      key: "receivedAt",
      label: "Received At",
      render: (order: IncomingOrderRow) => formatDateTime(order.receivedAt),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (order: IncomingOrderRow) => formatDateTime(order.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: IncomingOrderRow) => {
        const canLock = canLockIncomingOrder(order);
        const canReceive = canProcessIncomingOrder(order);
        const canForward = canForwardIncomingOrder(order);

        const isLocking = lockingOrderId === order.storeOrderId;
        const isReceiving = receivingOrderId === order.storeOrderId;
        const isForwarding = forwardingOrderId === order.storeOrderId;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetail(order)}
            >
              <Eye size={16} className="mr-1" />
              View
            </Button>

            {onLockOrder && canLock && (
              <Button
                size="sm"
                variant="outline"
                disabled={isLocking}
                onClick={() => onLockOrder(order)}
              >
                <Lock size={16} className="mr-1" />
                {isLocking ? "Locking..." : "Lock"}
              </Button>
            )}

            {onReceiveOrder && canReceive && (
              <Button
                size="sm"
                variant="outline"
                disabled={isReceiving}
                onClick={() => onReceiveOrder(order)}
              >
                <Hand size={16} className="mr-1" />
                {isReceiving ? "Receiving..." : "Receive"}
              </Button>
            )}

            {onForwardOrder && canForward && (
              <Button
                size="sm"
                variant="outline"
                disabled={isForwarding}
                onClick={() => onForwardOrder(order, "")}
              >
                <Send size={16} className="mr-1" />
                {isForwarding ? "Forwarding..." : "Forward"}
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
        Loading incoming orders...
      </div>
    );
  }

  return <DataTable columns={columns} data={tableData} />;
};

export default IncomingOrdersTable;