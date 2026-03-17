import React, { useMemo } from "react";
import { Eye, ClipboardList, Lock } from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";

import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import {
  canCreateProductionPlan,
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
  onViewDetail: (order: IncomingOrder) => void;
  onLockOrder?: (order: IncomingOrder) => void;
  onCreateProductionPlan?: (order: IncomingOrder) => void;
};

type IncomingOrderRow = IncomingOrder & {
  id: string;
};

const IncomingOrdersTable: React.FC<Props> = ({
  orders,
  loading = false,
  lockingOrderId,
  onViewDetail,
  onLockOrder,
  onCreateProductionPlan,
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
      key: "createdAt",
      label: "Created At",
      render: (order: IncomingOrderRow) => formatDateTime(order.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (order: IncomingOrderRow) => {
        const canLock = canProcessIncomingOrder(order);
        const canCreatePlan = canCreateProductionPlan(order);
        const isLocking = lockingOrderId === order.storeOrderId;

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

            {onLockOrder && (
              <Button
                size="sm"
                variant="outline"
                disabled={!canLock || isLocking}
                onClick={() => onLockOrder(order)}
              >
                <Lock size={16} className="mr-1" />
                {isLocking ? "Locking..." : "Lock"}
              </Button>
            )}

            {onCreateProductionPlan && (
              <Button
                size="sm"
                variant="outline"
                disabled={!canCreatePlan}
                onClick={() => onCreateProductionPlan(order)}
              >
                <ClipboardList size={16} className="mr-1" />
                Create Plan
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