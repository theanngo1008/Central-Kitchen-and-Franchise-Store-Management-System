import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useStoreOrderDetail } from "@/hooks/storeOrders/useStoreOrderDetail";
import { useSubmitStoreOrder } from "@/hooks/storeOrders/useSubmitStoreOrder";
import { useCancelStoreOrder } from "@/hooks/storeOrders/useCancelStoreOrder";
import type { StoreOrder } from "@/types/store/storeOrder.types";
import StoreOrderProgress from "./CreateOrder/components/StoreOrderProgress";

const DELIVERY_STATUS_HELPER: Record<string, string> = {
  FORWARDED_TO_SUPPLY: "Đơn hàng đã được chuyển sang bộ phận Supply để xử lý.",
  PREPARING: "Đơn hàng đang được chuẩn bị tại bếp trung tâm.",
  READY_TO_DELIVER: "Đơn hàng đã sẵn sàng và đang chờ giao đến cửa hàng.",
  IN_TRANSIT: "Đơn hàng hiện đang trên đường giao đến cửa hàng.",
  DELIVERED: "Đơn hàng đã giao đến cửa hàng. Vui lòng xác nhận nhận hàng.",
  RECEIVED_BY_STORE: "Cửa hàng đã xác nhận nhận hàng thành công.",
};

const getDeliveryHelperText = (status?: string | null) => {
  if (!status) return null;
  return DELIVERY_STATUS_HELPER[status] ?? null;
};

const getCurrentFranchiseId = () => {
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

const StoreOrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const franchiseId = getCurrentFranchiseId();
  const { orderId, storeId } = useParams();

  const parsedOrderId = orderId ? Number(orderId) : 0;
  const resolvedStoreId = storeId ?? String(franchiseId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data: detailResponse,
    isLoading,
    isError,
    refetch,
  } = useStoreOrderDetail(franchiseId, parsedOrderId);

  const submitOrder = useSubmitStoreOrder(franchiseId);
  const cancelOrder = useCancelStoreOrder(franchiseId);

  const order = detailResponse?.data;

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
    }).format(date);
  };

  const getTotalQty = (target?: StoreOrder) =>
    target?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const canEdit = !!order && order.status === "DRAFT";
  const canSubmit = !!order && order.status === "DRAFT";

  const canCancel = useMemo(() => {
    if (!order) return false;
    return order.status === "DRAFT" || order.status === "SUBMITTED";
  }, [order]);

  const handleSubmitOrder = async () => {
    if (!order) return;

    try {
      await submitOrder.mutateAsync(order.storeOrderId);
      toast.success(`Đã gửi đơn #${order.storeOrderId}`);
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Gửi đơn thất bại");
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;

    const reason = cancelReason.trim();
    if (!reason) {
      toast.error("Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      await cancelOrder.mutateAsync({
        orderId: order.storeOrderId,
        payload: { reason },
      });

      toast.success(`Đã hủy đơn #${order.storeOrderId}`);
      setCancelOpen(false);
      setCancelReason("");
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error("Hủy đơn thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Chi tiết đơn hàng"
          subtitle="Đang tải thông tin đơn hàng..."
        />
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Chi tiết đơn hàng"
          subtitle="Không thể tải thông tin đơn hàng"
        />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Không tìm thấy dữ liệu đơn hàng hoặc đã có lỗi xảy ra.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button onClick={() => refetch()}>Tải lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Chi tiết đơn hàng #${order.storeOrderId}`}
        subtitle="Theo dõi trạng thái và thông tin chi tiết đơn đặt hàng"
        action={{
          label: "Quay lại",
          icon: ArrowLeft,
          onClick: () => navigate(`/stores/${resolvedStoreId}/orders`),
        }}
      />

      <StoreOrderProgress status={order.status} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
          <StatusBadge status={order.status} />
          {getDeliveryHelperText(order.status) ? (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-800">
                {getDeliveryHelperText(order.status)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Ngày đặt</p>
          <p className="text-lg font-semibold">{formatDate(order.orderDate)}</p>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Sản phẩm</p>
          <p className="text-lg font-semibold">{order.items.length}</p>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Tổng số lượng</p>
          <p className="text-lg font-semibold">{getTotalQty(order)}</p>
        </div>
      </div>

      <div className="space-y-6">
        
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Mã đơn</span>
                  <span className="font-medium">#{order.storeOrderId}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Franchise ID</span>
                  <span>{order.franchiseId}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Ngày đặt</span>
                  <span>{formatDate(order.orderDate)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Cập nhật lần cuối
                  </span>
                  <span>{formatDateTime(order.updatedAt)}</span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Submitted at</span>
                  <span>{formatDateTime(order.submittedAt)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Locked at</span>
                  <span>{formatDateTime(order.lockedAt)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Cancelled at</span>
                  <span>{formatDateTime(order.cancelledAt)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Lý do hủy</span>
                  <span className="text-right">
                    {order.cancelReason || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h2>

            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Đơn hàng chưa có sản phẩm nào.
              </p>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/40 text-sm font-medium">
                  <div className="col-span-1 text-center">STT</div>
                  <div className="col-span-7">Sản phẩm</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-center">Đơn vị</div>
                </div>

                <div className="divide-y">
                  {order.items.map((item, index) => (
                    <div
                      key={item.productId}
                      className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
                    >
                      <div className="col-span-1 text-center">{index + 1}</div>
                      <div className="col-span-7 font-medium">
                        {item.productName}
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-center">{item.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>

      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) setCancelReason("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng #{order.storeOrderId}</DialogTitle>
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
              <Button variant="outline" onClick={() => setCancelOpen(false)}>
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
    </div>
  );
};

export default StoreOrderDetail;
