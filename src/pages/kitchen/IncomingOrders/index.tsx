import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";

import IncomingOrdersToolbar from "./components/IncomingOrdersToolbar";
import IncomingOrdersTable from "./components/IncomingOrdersTable";
import IncomingOrderDetailDialog from "./components/IncomingOrderDetailDialog";

import { useAuth } from "@/contexts/AuthContext";
import { useIncomingOrders } from "@/hooks/kitchen/useIncomingOrders";
import { useLockIncomingOrder } from "@/hooks/kitchen/useLockIncomingOrder";

import type { StoreOrderQuery } from "@/types/store/storeOrder.types";
import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import type { IncomingOrdersFilter } from "./helpers";
import {
  INCOMING_ORDER_DEFAULT_FILTER,
  getIncomingOrders,
  sortOrdersByNewest,
} from "./helpers";

const IncomingOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const centralKitchenId = Number(localStorage.getItem("centralKitchenId") ?? 0);

  const [filter, setFilter] = useState<IncomingOrdersFilter>(
    INCOMING_ORDER_DEFAULT_FILTER
  );
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);

  const queryParams = useMemo<StoreOrderQuery>(
    () => ({
      Page: 1,
      PageSize: 50,
      SortBy: "createdAt",
      SortDir: "desc",
    }),
    []
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useIncomingOrders(centralKitchenId, queryParams);

  const lockIncomingOrderMutation = useLockIncomingOrder();

  const rawOrders = response?.data?.items ?? [];

  const orders = useMemo(() => {
    const filtered = getIncomingOrders(rawOrders, filter);
    return sortOrdersByNewest(filtered);
  }, [rawOrders, filter]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Incoming orders refreshed");
    } catch {
      toast.error("Failed to refresh incoming orders");
    }
  };

  const handleViewDetail = (order: IncomingOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
  };

  const handleLockOrder = async (order: IncomingOrder) => {
    try {
      await lockIncomingOrderMutation.mutateAsync({
        franchiseId: order.franchiseId,
        orderId: order.storeOrderId,
      });

      await refetch();
      toast.success(`Order SO-${order.storeOrderId} locked successfully.`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to lock incoming order."
      );
    }
  };

  const handleCreateProductionPlan = (order: IncomingOrder) => {
    navigate("/kitchen/production", {
      state: {
        planDate: order.orderDate,
        source: "incoming-order",
        storeOrderId: order.storeOrderId,
        orderCode: `SO-${order.storeOrderId}`,
        franchiseName: order.franchiseName,
      },
    });
  };

  if (!user) return null;

  if (!centralKitchenId) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader
          title="Incoming Orders"
          subtitle="View and review store orders submitted to the central kitchen"
        />
        <div className="rounded-lg border bg-background p-6 text-sm text-destructive">
          Missing centralKitchenId in current login session.
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader
          title="Incoming Orders"
          subtitle="View and review store orders submitted to the central kitchen"
        />
        <div className="rounded-lg border bg-background p-6 text-sm text-destructive">
          Failed to load incoming orders.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Incoming Orders"
        subtitle="View and review store orders submitted to the central kitchen"
      />

      <IncomingOrdersToolbar
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={handleRefresh}
        refreshing={isFetching}
        totalOrders={orders.length}
      />

      <IncomingOrdersTable
        orders={orders}
        loading={isLoading}
        lockingOrderId={
          lockIncomingOrderMutation.variables?.orderId ?? null
        }
        onViewDetail={handleViewDetail}
        onLockOrder={handleLockOrder}
        onCreateProductionPlan={handleCreateProductionPlan}
      />

      <IncomingOrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default IncomingOrdersPage;