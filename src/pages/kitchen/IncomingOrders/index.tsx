import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/PageHeader";

import IncomingOrdersToolbar from "./components/IncomingOrdersToolbar";
import IncomingOrdersTable from "./components/IncomingOrdersTable";
import IncomingOrderDetailDialog from "./components/IncomingOrderDetailDialog";

import { useAuth } from "@/contexts/AuthContext";
import { useIncomingOrders } from "@/hooks/kitchen/useIncomingOrders";
import { useIncomingOrderDetail } from "@/hooks/kitchen/useIncomingOrderDetail";
import { useLockIncomingOrder } from "@/hooks/kitchen/useLockIncomingOrder";
import { useReceiveIncomingOrder } from "@/hooks/kitchen/useReceiveIncomingOrder";
import { useForwardIncomingOrder } from "@/hooks/kitchen/useForwardIncomingOrder";
import { useUpdateProcessingNote } from "@/hooks/kitchen/useUpdateProcessingNote";
import { incomingOrdersApi } from "@/api/kitchen/incomingOrdersApi";

import type { StoreOrderQuery } from "@/types/store/storeOrder.types";
import type { IncomingOrder } from "@/types/kitchen/incomingOrder.types";
import type { IncomingOrdersFilter } from "./helpers";
import {
  INCOMING_ORDER_DEFAULT_FILTER,
  getIncomingOrders,
  getInsufficientStockItems,
  hasSufficientCentralKitchenStock,
  sortOrdersByNewest,
} from "./helpers";

const IncomingOrdersPage: React.FC = () => {
  const { user } = useAuth();

  const centralKitchenId = Number(localStorage.getItem("centralKitchenId") ?? 0);

  const [filter, setFilter] = useState<IncomingOrdersFilter>(
    INCOMING_ORDER_DEFAULT_FILTER,
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const queryParams = useMemo<StoreOrderQuery>(
    () => ({
      Page: 1,
      PageSize: 50,
      SortBy: "createdAt",
      SortDir: "desc",
    }),
    [],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useIncomingOrders(centralKitchenId, queryParams);

  const {
    data: selectedOrderResponse,
    isLoading: detailLoading,
    isFetching: detailFetching,
    refetch: refetchDetail,
  } = useIncomingOrderDetail(centralKitchenId, selectedOrderId ?? 0);

  const selectedOrder = useMemo<IncomingOrder | null>(() => {
    if (!selectedOrderResponse) return null;
    return (selectedOrderResponse as any)?.data ?? selectedOrderResponse ?? null;
  }, [selectedOrderResponse]);

  const lockIncomingOrderMutation = useLockIncomingOrder();
  const receiveIncomingOrderMutation = useReceiveIncomingOrder();
  const forwardIncomingOrderMutation = useForwardIncomingOrder();
  const updateProcessingNoteMutation = useUpdateProcessingNote();

  const rawOrders = response?.data?.items ?? [];

  const orders = useMemo(() => {
    const filtered = getIncomingOrders(rawOrders, filter);
    return sortOrdersByNewest(filtered);
  }, [rawOrders, filter]);

  const handleRefresh = async () => {
    try {
      await refetch();
      if (selectedOrderId) {
        await refetchDetail();
      }
      toast.success("Incoming orders refreshed");
    } catch {
      toast.error("Failed to refresh incoming orders");
    }
  };

  const handleViewDetail = (order: IncomingOrder) => {
    setSelectedOrderId(order.storeOrderId);
  };

  const handleCloseDetail = () => {
    setSelectedOrderId(null);
  };

  const handleReceiveOrder = async (order: IncomingOrder) => {
    try {
      const franchiseId = Number(order.franchiseId ?? 0);

      if (!franchiseId) {
        toast.error("Missing franchiseId. Cannot receive this order.");
        return;
      }

      const latestDetailResponse = await incomingOrdersApi.detail(
        centralKitchenId,
        order.storeOrderId,
      );
      const latestOrder =
        (latestDetailResponse as any)?.data ?? latestDetailResponse;

      if (!latestOrder) {
        toast.error("Unable to load latest order detail.");
        return;
      }

      if (latestOrder.status !== "SUBMITTED") {
        toast.error(
          `Order SO-${order.storeOrderId} is currently ${latestOrder.status}. Please refresh and try again.`,
        );

        await refetch();

        if (selectedOrderId === order.storeOrderId) {
          setSelectedOrderId(order.storeOrderId);
          await refetchDetail();
        }

        return;
      }

      const lockResponse = await lockIncomingOrderMutation.mutateAsync({
        franchiseId,
        orderId: order.storeOrderId,
      });

      const receiveResult = await receiveIncomingOrderMutation.mutateAsync({
        centralKitchenId,
        orderId: order.storeOrderId,
        payload: {
          receiveNote: null,
        },
      });

      await refetch();

      if (selectedOrderId === order.storeOrderId) {
        await refetchDetail();
      }

      toast.success(
        receiveResult.message ||
          lockResponse?.message ||
          `Order SO-${order.storeOrderId} received successfully.`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to receive incoming order.",
      );
    }
  };

  const handleForwardOrder = async (
    order: IncomingOrder,
    note: string = "",
  ) => {
    try {
      const latestDetailResponse = await incomingOrdersApi.detail(
        centralKitchenId,
        order.storeOrderId,
      );
      const latestOrder =
        (latestDetailResponse as any)?.data ?? latestDetailResponse;

      if (!latestOrder) {
        toast.error("Unable to load latest order detail.");
        return;
      }

      if (latestOrder.status !== "RECEIVED_BY_KITCHEN") {
        toast.error(
          `Order SO-${order.storeOrderId} is currently ${latestOrder.status}. Please refresh and try again.`,
        );

        await refetch();

        if (selectedOrderId === order.storeOrderId) {
          await refetchDetail();
        }

        return;
      }

      if (!hasSufficientCentralKitchenStock(latestOrder)) {
        const insufficientItems = getInsufficientStockItems(latestOrder);

        toast.error(
          insufficientItems.length > 0
            ? `Cannot forward. ${insufficientItems
                .map((item) => item.productName)
                .join(", ")} ${
                insufficientItems.length === 1 ? "is" : "are"
              } insufficient in central kitchen stock.`
            : "Cannot forward because central kitchen inventory is insufficient.",
        );

        setSelectedOrderId(order.storeOrderId);
        await refetchDetail();
        return;
      }

      const result = await forwardIncomingOrderMutation.mutateAsync({
        centralKitchenId,
        orderId: order.storeOrderId,
        payload: {
          forwardNote: note?.trim() || "",
        },
      });

      await refetch();

      if (selectedOrderId === order.storeOrderId) {
        await refetchDetail();
      }

      toast.success(
        result.message ||
          `Order SO-${order.storeOrderId} forwarded to supply successfully.`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to forward order to supply.",
      );
    }
  };

  const handleSaveProcessingNote = async (
    order: IncomingOrder,
    note: string,
  ) => {
    try {
      const result = await updateProcessingNoteMutation.mutateAsync({
        centralKitchenId,
        orderId: order.storeOrderId,
        payload: {
          processingNote: note,
        },
      });

      await refetch();

      if (selectedOrderId === order.storeOrderId) {
        await refetchDetail();
      }

      toast.success(
        result.message ||
          `Processing note updated for order SO-${order.storeOrderId}.`,
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update processing note.",
      );
    }
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
          lockIncomingOrderMutation.isPending
            ? lockIncomingOrderMutation.variables?.orderId ?? null
            : null
        }
        receivingOrderId={
          receiveIncomingOrderMutation.isPending
            ? receiveIncomingOrderMutation.variables?.orderId ?? null
            : null
        }
        forwardingOrderId={
          forwardIncomingOrderMutation.isPending
            ? forwardIncomingOrderMutation.variables?.orderId ?? null
            : null
        }
        onViewDetail={handleViewDetail}
        onReceiveOrder={handleReceiveOrder}
        onForwardOrder={handleForwardOrder}
      />

      <IncomingOrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrderId}
        onClose={handleCloseDetail}
        onSaveProcessingNote={handleSaveProcessingNote}
        onForwardToSupply={handleForwardOrder}
        savingProcessingNote={updateProcessingNoteMutation.isPending}
        forwardingToSupply={forwardIncomingOrderMutation.isPending}
        loading={detailLoading || detailFetching}
        centralKitchenId={centralKitchenId}
      />
    </div>
  );
};

export default IncomingOrdersPage;