import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Truck,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
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

const DELIVERY_STATUSES = [
  "FORWARDED_TO_SUPPLY",
  "PREPARING",
  "READY_TO_DELIVER",
  "IN_TRANSIT",
  "DELIVERED",
  "RECEIVED_BY_STORE",
] as const;

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "DRAFT", label: "Nháp" },
  { value: "SUBMITTED", label: "Đã gửi" },
  { value: "LOCKED", label: "Đã khóa" },
  { value: "RECEIVED_BY_KITCHEN", label: "Bếp tiếp nhận" },
  { value: "FORWARDED_TO_SUPPLY", label: "Chuyển Cung ứng" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "READY_TO_DELIVER", label: "Sẵn sàng giao" },
  { value: "IN_TRANSIT", label: "Đang vận chuyển" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "RECEIVED_BY_STORE", label: "Cửa hàng đã nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

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
      PageSize: 50,
      SortBy: "orderDate",
      SortDir: "desc",
    };
  }, [statusFilter]);

  const {
    data: ordersResponse,
    isLoading,
    refetch,
    isFetching,
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

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
    }).format(date);
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const getTotalQty = (order: StoreOrder) => {
    const productQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const ingredientQty = (order.ingredientItems ?? []).reduce((sum, item) => sum + item.quantity, 0);
    return productQty + ingredientQty;
  };

  const canModifyOrder = (order: StoreOrder) => {
    const isLockedByTime =
      !!order.lockedAt && new Date(order.lockedAt) <= new Date();

    const isInDeliveryFlow = DELIVERY_STATUSES.includes(
      order.status as (typeof DELIVERY_STATUSES)[number],
    );

    return (
      order.status !== "LOCKED" &&
      order.status !== "CANCELLED" &&
      !order.cancelledAt &&
      !isLockedByTime &&
      !isInDeliveryFlow
    );
  };

  const getOrderCode = (order: StoreOrder) => {
    // @ts-ignore – orderCode may exist on newer backend responses
    return (order as any).orderCode || `SO-${String(order.storeOrderId).padStart(6, "0")}`;
  };

  const columns = [
    {
      key: "storeOrderId",
      label: "Mã đơn",
      render: (order: OrderRow) => (
        <span className="font-semibold text-primary">{getOrderCode(order)}</span>
      ),
    },
    {
      key: "orderDate",
      label: "Ngày yêu cầu giao",
      render: (order: OrderRow) => formatDate(order.orderDate),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (order: OrderRow) => formatDateTime(order.createdAt),
    },
    {
      key: "itemsCount",
      label: "Sản phẩm",
      render: (order: OrderRow) => {
        const hasDropped = (order.droppedTotalItems ?? 0) > 0;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary" className="w-fit">{order.items.length} SP</Badge>
            {hasDropped && (
              <Badge variant="outline" className="w-fit text-[10px] text-destructive border-destructive bg-destructive/5 hover:bg-destructive/10 cursor-help" title={`${order.droppedTotalItems} sản phẩm đã bị hủy do thiếu kho`}>
                <XCircle size={10} className="mr-0.5" /> {order.droppedTotalItems} hủy
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "totalQty",
      label: "Tổng SL",
      render: (order: OrderRow) => {
        const requested = order.totalQuantity ?? getTotalQty(order);
        
        // Calculate forwarded total from items if missing at root
        const forwardedItemsQty = order.items.reduce((sum, item) => sum + (item.forwardedQuantity ?? item.quantity), 0);
        const forwardedIngredientsQty = (order.ingredientItems ?? []).reduce((sum, item) => sum + (item.forwardedQuantity ?? item.quantity), 0);
        const delivered = order.forwardedTotalQuantity ?? (order.status === "DRAFT" || order.status === "SUBMITTED" ? null : (forwardedItemsQty + forwardedIngredientsQty));
        
        const isPartial = delivered != null && delivered > 0 && delivered < requested;

        return (
          <div className="flex flex-col gap-0.5">
            <span className={`font-medium ${isPartial ? "line-through text-muted-foreground text-xs" : ""}`}>
              {requested}
            </span>
            {isPartial && (
              <div className="flex items-center gap-1 text-primary font-bold">
                <span>{delivered}</span>
                <AlertTriangle size={10} className="text-amber-500" />
              </div>
            )}
          </div>
        );
      },
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
            <Eye size={14} className="mr-1" />
            Xem
          </Button>

          {canModifyOrder(order) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate(
                    `/stores/${storeId ?? franchiseId}/orders/${order.storeOrderId}/edit`,
                  );
                }}
              >
                <Pencil size={14} className="mr-1" />
                Sửa
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setCancelingOrder(order);
                  setCancelReason("");
                }}
              >
                <XCircle size={14} className="mr-1" />
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
  const deliveryCount = orders.filter((o) =>
    DELIVERY_STATUSES.includes(o.status as (typeof DELIVERY_STATUSES)[number]),
  ).length;
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

      toast.success(`Đã hủy đơn ${getOrderCode(cancelingOrder)}`);
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
        action={{
          label: "Tạo đơn mới",
          icon: PlusCircle,
          onClick: () => navigate(`/stores/${storeId ?? franchiseId}/orders/create`),
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Tổng đơn</p>
            <ClipboardList size={16} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Nháp</p>
            <Clock3 size={16} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Đã gửi / Đang xử lý</p>
            <Package size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{submittedCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Đang giao / Chờ nhận</p>
            <Truck size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{deliveryCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Đã hủy</p>
            <XCircle size={16} className="text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">{cancelledCount}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm theo mã đơn, trạng thái, ngày đặt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="statusFilter" className="shrink-0 text-sm">
            Trạng thái
          </Label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm min-w-[180px]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Làm mới"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          Đang tải danh sách đơn hàng...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Không có đơn hàng nào</p>
          <p className="text-sm text-muted-foreground mt-1">Thử thay đổi bộ lọc hoặc tạo đơn mới.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={tableData} />
      )}

      {/* Cancel Dialog */}
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
              Hủy đơn hàng {cancelingOrder ? getOrderCode(cancelingOrder) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn này không? Hành động này không thể hoàn tác.
            </p>

            <div className="space-y-2">
              <Label htmlFor="cancelReason">Lý do hủy <span className="text-destructive">*</span></Label>
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
                disabled={cancelOrder.isPending || !cancelReason.trim()}
              >
                {cancelOrder.isPending ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;