import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/PageHeader";

import IncomingOrdersToolbar from "./components/IncomingOrdersToolbar";
import IncomingOrdersTable from "./components/IncomingOrdersTable";
import IncomingOrderDetailDialog from "./components/IncomingOrderDetailDialog";

import { useAuth } from "@/contexts/AuthContext";
import { useIncomingOrders } from "@/hooks/kitchen/useIncomingOrders";
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
  sortOrdersByNewest,
} from "./helpers";

const IncomingOrdersPage: React.FC = () => {
  const { user } = useAuth();

  const centralKitchenId = Number(
    localStorage.getItem("centralKitchenId") ?? 0
  );

  const [filter, setFilter] = useState<IncomingOrdersFilter>(
    INCOMING_ORDER_DEFAULT_FILTER
  );
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

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
      toast.success("Incoming orders refreshed");
    } catch {
      toast.error("Failed to refresh incoming orders");
    }
  };

  const handleViewDetail = async (order: IncomingOrder) => {
    try {
      setDetailLoading(true);

      const response = await incomingOrdersApi.detail(
        centralKitchenId,
        order.storeOrderId
      );

      const detail = (response as any)?.data ?? response;
      setSelectedOrder(detail);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load order detail."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    setDetailLoading(false);
  };

  const handleLockOrder = async (order: IncomingOrder) => {
    try {
      const franchiseId = Number(order.franchiseId ?? 0);

      if (!franchiseId) {
        toast.error("Missing franchiseId. Cannot lock this order.");
        return;
      }

      const response = await lockIncomingOrderMutation.mutateAsync({
        franchiseId,
        orderId: order.storeOrderId,
      });

      const result = response?.data;

      await refetch();

      toast.success(
        response?.message ||
          `Order SO-${order.storeOrderId} locked successfully.`
      );

      if (selectedOrder?.storeOrderId === order.storeOrderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: result?.status ?? "LOCKED",
          lockedAt: result?.lockedAt ?? selectedOrder.lockedAt ?? null,
          updatedAt: result?.updatedAt ?? selectedOrder.updatedAt,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to lock order.");
    }
  };

  const handleReceiveOrder = async (order: IncomingOrder) => {
    try {
      const result = await receiveIncomingOrderMutation.mutateAsync({
        centralKitchenId,
        orderId: order.storeOrderId,
        payload: {
          receiveNote: null,
        },
      });

      await refetch();

      toast.success(
        result.message ||
          `Order SO-${order.storeOrderId} received successfully.`
      );

      if (selectedOrder?.storeOrderId === order.storeOrderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: result.status,
          receivedAt: result.receivedAt ?? null,
          receivedBy: result.receivedBy ?? null,
          receiveNote: result.receiveNote ?? null,
          processingNote: result.processingNote ?? null,
          processingNoteUpdatedAt: result.processingNoteUpdatedAt ?? null,
          processingNoteUpdatedBy: result.processingNoteUpdatedBy ?? null,
          forwardedAt: result.forwardedAt ?? null,
          forwardedBy: result.forwardedBy ?? null,
          forwardNote: result.forwardNote ?? null,
          preparedAt: result.preparedAt ?? null,
          preparedBy: result.preparedBy ?? null,
          preparingNote: result.preparingNote ?? null,
          updatedAt: result.updatedAt ?? selectedOrder.updatedAt,
          updatedBy: result.updatedBy ?? selectedOrder.updatedBy ?? null,
          statusNote: result.statusNote ?? null,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to receive incoming order."
      );
    }
  };

  const handleForwardOrder = async (order: IncomingOrder, note: string = "") => {
    try {
      const result = await forwardIncomingOrderMutation.mutateAsync({
        centralKitchenId,
        orderId: order.storeOrderId,
        payload: {
          forwardNote: note?.trim() || "",
        },
      });

      await refetch();

      toast.success(
        result.message ||
          `Order SO-${order.storeOrderId} forwarded to supply successfully.`
      );

      if (selectedOrder?.storeOrderId === order.storeOrderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: result.status,
          receivedAt: result.receivedAt ?? selectedOrder.receivedAt ?? null,
          receivedBy: result.receivedBy ?? selectedOrder.receivedBy ?? null,
          receiveNote: result.receiveNote ?? selectedOrder.receiveNote ?? null,
          processingNote: result.processingNote ?? selectedOrder.processingNote ?? null,
          processingNoteUpdatedAt:
            result.processingNoteUpdatedAt ??
            selectedOrder.processingNoteUpdatedAt ??
            null,
          processingNoteUpdatedBy:
            result.processingNoteUpdatedBy ??
            selectedOrder.processingNoteUpdatedBy ??
            null,
          forwardedAt: result.forwardedAt ?? null,
          forwardedBy: result.forwardedBy ?? null,
          forwardNote: result.forwardNote ?? null,
          preparedAt: result.preparedAt ?? selectedOrder.preparedAt ?? null,
          preparedBy: result.preparedBy ?? selectedOrder.preparedBy ?? null,
          preparingNote:
            result.preparingNote ?? selectedOrder.preparingNote ?? null,
          updatedAt: result.updatedAt ?? selectedOrder.updatedAt,
          updatedBy: result.updatedBy ?? selectedOrder.updatedBy ?? null,
          statusNote: result.statusNote ?? selectedOrder.statusNote ?? null,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to forward order to supply."
      );
    }
  };

  const handleSaveProcessingNote = async (
    order: IncomingOrder,
    note: string
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

      toast.success(
        result.message ||
          `Processing note updated for order SO-${order.storeOrderId}.`
      );

      if (selectedOrder?.storeOrderId === order.storeOrderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: result.status,
          receivedAt: result.receivedAt ?? selectedOrder.receivedAt ?? null,
          receivedBy: result.receivedBy ?? selectedOrder.receivedBy ?? null,
          receiveNote: result.receiveNote ?? selectedOrder.receiveNote ?? null,
          processingNote: result.processingNote ?? null,
          processingNoteUpdatedAt:
            result.processingNoteUpdatedAt ??
            selectedOrder.processingNoteUpdatedAt ??
            null,
          processingNoteUpdatedBy:
            result.processingNoteUpdatedBy ??
            selectedOrder.processingNoteUpdatedBy ??
            null,
          forwardedAt: result.forwardedAt ?? selectedOrder.forwardedAt ?? null,
          forwardedBy: result.forwardedBy ?? selectedOrder.forwardedBy ?? null,
          forwardNote: result.forwardNote ?? selectedOrder.forwardNote ?? null,
          preparedAt: result.preparedAt ?? selectedOrder.preparedAt ?? null,
          preparedBy: result.preparedBy ?? selectedOrder.preparedBy ?? null,
          preparingNote:
            result.preparingNote ?? selectedOrder.preparingNote ?? null,
          updatedAt: result.updatedAt ?? selectedOrder.updatedAt,
          updatedBy: result.updatedBy ?? selectedOrder.updatedBy ?? null,
          statusNote: result.statusNote ?? selectedOrder.statusNote ?? null,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update processing note."
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
        lockingOrderId={lockIncomingOrderMutation.variables?.orderId ?? null}
        receivingOrderId={
          receiveIncomingOrderMutation.variables?.orderId ?? null
        }
        forwardingOrderId={
          forwardIncomingOrderMutation.variables?.orderId ?? null
        }
        onViewDetail={handleViewDetail}
        onLockOrder={handleLockOrder}
        onReceiveOrder={handleReceiveOrder}
        onForwardOrder={handleForwardOrder}
      />

      <IncomingOrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder || detailLoading}
        onClose={handleCloseDetail}
        onSaveProcessingNote={handleSaveProcessingNote}
        onForwardToSupply={handleForwardOrder}
        savingProcessingNote={updateProcessingNoteMutation.isPending}
        forwardingToSupply={forwardIncomingOrderMutation.isPending}
        loading={detailLoading}
        centralKitchenId={centralKitchenId}
      />
    </div>
  );
};

export default IncomingOrdersPage;