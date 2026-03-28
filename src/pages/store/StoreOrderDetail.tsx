import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  X,
  FlaskConical,
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
import type { StoreOrder, StoreOrderItem, StoreOrderIngredientItem } from "@/types/store/storeOrder.types";
import StoreOrderProgress from "./CreateOrder/components/StoreOrderProgress";

const DELIVERY_STATUS_HELPER: Record<string, string> = {
  FORWARDED_TO_SUPPLY: "Đơn hàng đã được chuyển sang bộ phận Cung ứng để xử lý.",
  PREPARING: "Đơn hàng đang được chuẩn bị tại Bếp Trung Tâm.",
  READY_TO_DELIVER: "Đơn hàng đã sẵn sàng và đang chờ giao đến cửa hàng.",
  IN_TRANSIT: "Đơn hàng hiện đang trên đường giao đến cửa hàng.",
  DELIVERED: "Đơn hàng đã giao đến cửa hàng. Vui lòng xác nhận nhận hàng.",
  RECEIVED_BY_STORE: "Cửa hàng đã xác nhận nhận hàng thành công.",
};

const getCurrentFranchiseId = () => {
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

const getOrderCode = (order: StoreOrder) =>
  order.orderCode || `SO-${String(order.storeOrderId).padStart(6, "0")}`;

const isItemDropped = (item: StoreOrderItem) =>
  item.isDroppedFromForward === true;

const isItemPartial = (item: StoreOrderItem) =>
  typeof item.forwardedQuantity === "number" &&
  item.forwardedQuantity > 0 &&
  item.forwardedQuantity < item.quantity;

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
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(date);
  };

  const droppedItems = useMemo(() => order?.items.filter(isItemDropped) ?? [], [order]);
  const partialItems = useMemo(() => order?.items.filter(isItemPartial) ?? [], [order]);
  const hasDroppedOrPartial = droppedItems.length > 0 || partialItems.length > 0;

  const canSubmit = !!order && order.status === "DRAFT";
  const canCancel = !!order && (order.status === "DRAFT" || order.status === "SUBMITTED");

  const handleSubmitOrder = async () => {
    if (!order) return;
    try {
      await submitOrder.mutateAsync(order.storeOrderId);
      toast.success(`Đã gửi đơn ${getOrderCode(order)}`);
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
      await cancelOrder.mutateAsync({ orderId: order.storeOrderId, payload: { reason } });
      toast.success(`Đã hủy đơn ${getOrderCode(order)}`);
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
        <PageHeader title="Chi tiết đơn hàng" subtitle="Đang tải..." />
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Đang tải thông tin đơn hàng...
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Chi tiết đơn hàng" subtitle="Không thể tải thông tin" />
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Không tìm thấy dữ liệu hoặc đã có lỗi xảy ra.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            <Button onClick={() => refetch()}>Tải lại</Button>
          </div>
        </div>
      </div>
    );
  }

  const helperText = DELIVERY_STATUS_HELPER[order.status];

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title={`Đơn hàng ${getOrderCode(order)}`}
        subtitle="Theo dõi trạng thái và thông tin chi tiết đơn đặt hàng"
        action={{
          label: "Quay lại",
          icon: ArrowLeft,
          onClick: () => navigate(`/stores/${resolvedStoreId}/orders`),
        }}
      />

      <StoreOrderProgress status={order.status} />

      {/* ⚠️ Dropped / partial alert banner */}
      {hasDroppedOrPartial && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Đơn hàng bị thay đổi khi xử lý</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Do tồn kho tại Bếp Trung Tâm không đủ, một số sản phẩm trong đơn của bạn đã bị{" "}
                <strong>hủy hoàn toàn</strong> hoặc <strong>giao một phần</strong>.
                Xem chi tiết bên dưới.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
          <StatusBadge status={order.status} />
          {helperText && (
            <p className="text-xs text-blue-700 mt-2 italic">{helperText}</p>
          )}
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Ngày yêu cầu giao</p>
          <p className="font-semibold">{formatDate(order.requestedDeliveryDate || order.orderDate)}</p>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Tổng đặt / Giao</p>
          <p className="font-semibold">
            {order.totalQuantity ?? order.items.reduce((s, i) => s + i.quantity, 0)}
            {order.forwardedTotalQuantity != null && order.forwardedTotalQuantity > 0 && (
              <span className="text-green-600 ml-1 text-sm">→ {order.forwardedTotalQuantity}</span>
            )}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Đã hủy</p>
          <p className={`font-semibold ${(order.droppedTotalQuantity ?? 0) > 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {order.droppedTotalQuantity ?? 0}
          </p>
        </div>
      </div>

      {/* Order info */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">Thông tin đơn hàng</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã đơn</span>
              <span className="font-semibold text-primary">{getOrderCode(order)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày tạo</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cập nhật lần cuối</span>
              <span>{formatDateTime(order.updatedAt)}</span>
            </div>
            {order.processingNote && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Ghi chú xử lý</span>
                <span className="text-right italic text-muted-foreground">{order.processingNote}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đã gửi lúc</span>
              <span>{formatDateTime(order.submittedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đã chuyển Cung ứng</span>
              <span>{formatDateTime(order.forwardedAt)}</span>
            </div>
            {order.forwardNote && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Ghi chú giao hàng</span>
                <span className="text-right italic">{order.forwardNote}</span>
              </div>
            )}
            {order.cancelReason && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Lý do hủy</span>
                <span className="text-right text-destructive">{order.cancelReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Items list */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">Danh sách sản phẩm</h2>

        {order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Đơn hàng chưa có sản phẩm nào.</p>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">SL đặt</div>
              <div className="col-span-2 text-center">SL giao</div>
              <div className="col-span-2 text-center">Trạng thái</div>
            </div>
            <div className="divide-y">
              {order.items.map((item, index) => {
                const dropped = isItemDropped(item);
                const partial = isItemPartial(item);
                return (
                  <div
                    key={item.productId}
                    className={[
                      "grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center",
                      dropped ? "bg-destructive/5" : partial ? "bg-yellow-50" : "",
                    ].join(" ")}
                  >
                    <div className="col-span-1 text-center text-muted-foreground">{index + 1}</div>
                    <div className="col-span-5">
                      <p className={`font-medium ${dropped ? "line-through text-muted-foreground" : ""}`}>
                        {item.productName}
                      </p>
                      {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                      {item.dropReason && (
                        <p className="text-xs text-destructive mt-0.5 italic">Lý do: {item.dropReason}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {item.quantity} <span className="text-muted-foreground text-xs">{item.unit}</span>
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {dropped ? (
                        <span className="text-destructive">0 {item.unit}</span>
                      ) : partial ? (
                        <span className="text-yellow-700">{item.forwardedQuantity} {item.unit}</span>
                      ) : typeof item.forwardedQuantity === "number" ? (
                        <span className="text-green-700">{item.forwardedQuantity} {item.unit}</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {dropped ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          <X size={10} /> Bị hủy
                        </span>
                      ) : partial ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle size={10} /> Một phần
                        </span>
                      ) : typeof item.forwardedQuantity === "number" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 size={10} /> Đủ
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">–</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Items list */}
      {(order.ingredientItems ?? []).length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FlaskConical size={18} className="text-blue-600" />
            Danh sách nguyên liệu
          </h2>
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-blue-50 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6">Nguyên liệu</div>
              <div className="col-span-2 text-center">SL đặt</div>
              <div className="col-span-3 text-center">SL giao</div>
            </div>
            <div className="divide-y">
              {(order.ingredientItems ?? []).map((item: StoreOrderIngredientItem, index: number) => {
                const dropped = item.isDroppedFromForward === true;
                const partial =
                  typeof item.forwardedQuantity === "number" &&
                  item.forwardedQuantity > 0 &&
                  item.forwardedQuantity < item.quantity;
                return (
                  <div
                    key={item.ingredientId}
                    className={[
                      "grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center",
                      dropped ? "bg-destructive/5" : partial ? "bg-yellow-50" : "",
                    ].join(" ")}
                  >
                    <div className="col-span-1 text-center text-muted-foreground">{index + 1}</div>
                    <div className="col-span-6">
                      <p className={`font-medium ${dropped ? "line-through text-muted-foreground" : ""}`}>
                        {item.ingredientName}
                      </p>
                      {item.dropReason && (
                        <p className="text-xs text-destructive mt-0.5 italic">Lý do: {item.dropReason}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {item.quantity} <span className="text-muted-foreground text-xs">{item.unit}</span>
                    </div>
                    <div className="col-span-3 text-center font-medium">
                      {dropped ? (
                        <span className="text-destructive">0 {item.unit}</span>
                      ) : partial ? (
                        <span className="text-yellow-700">{item.forwardedQuantity} {item.unit}</span>
                      ) : typeof item.forwardedQuantity === "number" ? (
                        <span className="text-green-700">{item.forwardedQuantity} {item.unit}</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {(canSubmit || canCancel) && (
        <div className="flex gap-3 justify-end">
          {canSubmit && (
            <Button onClick={handleSubmitOrder} disabled={submitOrder.isPending}>
              <PackageCheck size={16} className="mr-2" />
              {submitOrder.isPending ? "Đang gửi..." : "Gửi đơn"}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => { setCancelOpen(true); setCancelReason(""); }}
            >
              <XCircle size={16} className="mr-2" />
              Hủy đơn
            </Button>
          )}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) setCancelReason("");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng {getOrderCode(order)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn hủy đơn này không? Hành động này không thể hoàn tác.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">
                Lý do hủy <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancelReason"
                placeholder="Nhập lý do hủy đơn..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelOpen(false)}>Đóng</Button>
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

export default StoreOrderDetail;
