import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Pencil,
  ClipboardList,
  Package,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useStoreOrders } from "@/hooks/storeOrders/useStoreOrders";
import { useCancelStoreOrder } from "@/hooks/storeOrders/useCancelStoreOrder";
import type { StoreOrder } from "@/types/store/storeOrder.types";

type OrderRow = StoreOrder & {
  id: string;
};

const getCurrentFranchiseId = () => {
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

const OrderList: React.FC = () => {
  const franchiseId = getCurrentFranchiseId();
  const navigate = useNavigate();
  const { storeId } = useParams();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [cancelingOrder, setCancelingOrder] = useState<StoreOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const queryParams = useMemo(() => {
    return {
      Status: statusFilter === "ALL" ? undefined : statusFilter,
      Page: 1,
      PageSize: 20,
      SortBy: "orderDate",
      SortDir: "desc",
    };
  }, [statusFilter]);

  const {
    data: ordersResponse,
    isLoading,
    refetch,
  } = useStoreOrders(franchiseId, queryParams);

  const cancelOrder = useCancelStoreOrder(franchiseId);

  const orders = ordersResponse?.data?.items ?? [];

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((order) => {
      return (
        String(order.storeOrderId).includes(keyword) ||
        order.status.toLowerCase().includes(keyword) ||
        order.orderDate.toLowerCase().includes(keyword)
      );
    });
  }, [orders, search]);

  const tableData: OrderRow[] = filteredOrders.map((order) => ({
    ...order,
    id: String(order.storeOrderId),
  }));

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const getTotalQty = (order: StoreOrder) =>
    order.items.reduce((sum, item) => sum + item.quantity, 0);

  const canModifyOrder = (order: StoreOrder) => {
    const isLockedByTime =
      !!order.lockedAt && new Date(order.lockedAt) <= new Date();

    return (
      order.status !== "LOCKED" &&
      order.status !== "CANCELLED" &&
      !order.cancelledAt &&
      !isLockedByTime
    );
  };

  const columns = [
    {
      key: "storeOrderId",
      label: "Mã đơn",
      render: (order: OrderRow) => (
        <span className="font-medium">#{order.storeOrderId}</span>
      ),
    },
    {
      key: "orderDate",
      label: "Ngày đặt",
      render: (order: OrderRow) => formatDateTime(order.orderDate),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (order: OrderRow) => formatDateTime(order.createdAt),
    },
    {
      key: "itemsCount",
      label: "Sản phẩm",
      render: (order: OrderRow) => `${order.items.length} sản phẩm`,
    },
    {
      key: "totalQty",
      label: "Tổng SL",
      render: (order: OrderRow) => getTotalQty(order),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (order: OrderRow) => <StatusBadge status={order.status} />,
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (order: OrderRow) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/stores/${storeId ?? franchiseId}/orders/${order.storeOrderId}`)
            }
          >
            <Eye size={16} className="mr-2" />
            Xem
          </Button>

          {canModifyOrder(order) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(
                    `/stores/${storeId ?? franchiseId}/orders/${order.storeOrderId}/edit`,
                  );
                }}
              >
                <Pencil size={16} className="mr-2" />
                Sửa
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setCancelingOrder(order);
                  setCancelReason("");
                }}
              >
                <XCircle size={16} className="mr-2" />
                Hủy
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const totalOrders = orders.length;
  const draftCount = orders.filter((o) => o.status === "DRAFT").length;
  const submittedCount = orders.filter((o) => o.status === "SUBMITTED").length;
  const lockedCount = orders.filter((o) => o.status === "LOCKED").length;
  const cancelledCount = orders.filter((o) => o.status === "CANCELLED").length;

  const handleConfirmCancel = async () => {
    if (!cancelingOrder) return;

    const reason = cancelReason.trim();
    if (!reason) {
      toast.error("Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      await cancelOrder.mutateAsync({
        orderId: cancelingOrder.storeOrderId,
        payload: { reason },
      });

      toast.success(`Đã hủy đơn #${cancelingOrder.storeOrderId}`);
      setCancelingOrder(null);
      setCancelReason("");
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Hủy đơn thất bại");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Đơn hàng của tôi"
        subtitle="Theo dõi và quản lý các đơn đặt hàng của cửa hàng"
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm theo mã đơn, trạng thái, ngày đặt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <Label htmlFor="statusFilter" className="mb-2 block">
            Trạng thái
          </Label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="LOCKED">LOCKED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
            <ClipboardList size={18} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">DRAFT</p>
            <Clock3 size={18} className="text-warning" />
          </div>
          <p className="text-2xl font-semibold">{draftCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">SUBMITTED</p>
            <Package size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{submittedCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">LOCKED</p>
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{lockedCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">CANCELLED</p>
            <XCircle size={18} className="text-destructive" />
          </div>
          <p className="text-2xl font-semibold">{cancelledCount}</p>
        </div>
      </div>

      <DataTable columns={columns} data={tableData} />

      <Dialog
        open={!!cancelingOrder}
        onOpenChange={(open) => {
          if (!open) {
            setCancelingOrder(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Hủy đơn hàng #{cancelingOrder?.storeOrderId}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn này không? Vui lòng nhập lý do hủy.
            </p>

            <div className="space-y-2">
              <Label htmlFor="cancelReason">Lý do hủy</Label>
              <Textarea
                id="cancelReason"
                placeholder="Nhập lý do hủy đơn..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelingOrder(null);
                  setCancelReason("");
                }}
              >
                Đóng
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={cancelOrder.isPending}
              >
                {cancelOrder.isPending ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="mt-4 text-sm text-muted-foreground">Đang tải dữ liệu...</div>
      ) : null}
    </div>
  );
};

export default OrderList;