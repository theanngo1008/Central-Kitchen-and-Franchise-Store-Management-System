import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  Pencil,
  XCircle,
} from "lucide-react";
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

const getCurrentFranchiseId = () => {
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

type TimelineItem = {
  key: string;
  label: string;
  value: string | null | undefined;
  icon: React.ReactNode;
  tone?: "default" | "success" | "danger";
  note?: string | null;
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

    const isLockedByTime =
      !!order.lockedAt && new Date(order.lockedAt) <= new Date();

    return (
      order.status !== "LOCKED" &&
      order.status !== "CANCELLED" &&
      !order.cancelledAt &&
      !isLockedByTime
    );
  }, [order]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    if (!order) return [];

    const items: TimelineItem[] = [
      {
        key: "created",
        label: "Tạo đơn",
        value: order.createdAt,
        icon: <Clock3 size={16} />,
        tone: "default",
      },
      {
        key: "submitted",
        label: "Gửi đơn",
        value: order.submittedAt,
        icon: <Package size={16} />,
        tone: "success",
      },
      {
        key: "locked",
        label: "Khóa đơn",
        value: order.lockedAt,
        icon: <CheckCircle2 size={16} />,
        tone: "success",
      },
      {
        key: "cancelled",
        label: "Hủy đơn",
        value: order.cancelledAt,
        icon: <XCircle size={16} />,
        tone: "danger",
        note: order.cancelReason,
      },
    ];

    return items.filter((item) => !!item.value);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
          <StatusBadge status={order.status} />
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
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

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Theo dõi trạng thái</h2>

            {timelineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có mốc trạng thái nào ngoài trạng thái hiện tại.
              </p>
            ) : (
              <div className="space-y-4">
                {timelineItems.map((item, index) => (
                  <div key={item.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full border",
                          item.tone === "success"
                            ? "bg-success/10 text-success border-success/20"
                            : item.tone === "danger"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-muted text-foreground border-border",
                        ].join(" ")}
                      >
                        {item.icon}
                      </div>
                      {index < timelineItems.length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>

                    <div className="pt-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(item.value)}
                      </p>
                      {item.note ? (
                        <p className="text-sm text-destructive mt-1">
                          Lý do: {item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Thao tác</h2>

            <div className="space-y-3">
              {canEdit && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    navigate(
                      `/stores/${resolvedStoreId}/orders/${order.storeOrderId}/edit`,
                    )
                  }
                >
                  <Pencil size={16} className="mr-2" />
                  Chỉnh sửa đơn hàng
                </Button>
              )}

              {canSubmit && (
                <Button
                  className="w-full justify-start"
                  onClick={handleSubmitOrder}
                  disabled={submitOrder.isPending}
                >
                  <Package size={16} className="mr-2" />
                  {submitOrder.isPending ? "Đang gửi..." : "Gửi đơn hàng"}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    setCancelReason("");
                    setCancelOpen(true);
                  }}
                >
                  <XCircle size={16} className="mr-2" />
                  Hủy đơn hàng
                </Button>
              )}

              {!canEdit && !canSubmit && !canCancel && (
                <p className="text-sm text-muted-foreground">
                  Đơn hàng hiện không có thao tác khả dụng.
                </p>
              )}
            </div>
          </div>
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
