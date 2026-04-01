import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useStoreOrderDetail } from "@/hooks/storeOrders/useStoreOrderDetail";
import { authApi } from "@/api/auth";
import { Box, FlaskConical, Loader2, Calendar, User, FileText } from "lucide-react";

interface HistoryOrderDetailModalProps {
  orderId: number | null;
  storeId: number | null;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryOrderDetailModal: React.FC<HistoryOrderDetailModalProps> = ({
  orderId,
  storeId,
  storeName,
  isOpen,
  onClose,
}) => {
  const currentUser = authApi.getCurrentUser();
  const centralKitchenId = Number(currentUser?.centralKitchenId) || 0;

  const { data: response, isLoading } = useStoreOrderDetail(
    storeId || 0,
    orderId || 0
  );

  const order = response?.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <span>Chi tiết đơn hàng {order?.orderCode}</span>
              {order && <StatusBadge status={order.status} />}
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Đang tải chi tiết đơn hàng...</p>
          </div>
        ) : !order ? (
          <div className="py-12 text-center text-muted-foreground">
            Không tìm thấy thông tin đơn hàng.
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cửa hàng:</span>
                  <span>{storeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Ngày yêu cầu:</span>
                  <span>{order.requestedDeliveryDate}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Ngày tạo:</span>
                  <span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                {order.forwardedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Ngày điều phối:</span>
                    <span>{new Date(order.forwardedAt).toLocaleString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Products Table */}
            {order.items.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Box className="w-4 h-4 text-primary" />
                  Danh sách sản phẩm ({order.items.length})
                </h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="px-4 py-2 text-left font-medium">Sản phẩm</th>
                        <th className="px-4 py-2 text-center font-medium">Yêu cầu</th>
                        <th className="px-4 py-2 text-center font-medium">Thực giao</th>
                        <th className="px-4 py-2 text-left font-medium">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.items.map((item) => (
                        <tr key={item.productId} className="hover:bg-muted/10">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.productName}</div>
                            {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-primary">
                            {item.forwardedQuantity} {item.unit}
                          </td>
                          <td className="px-4 py-3">
                            {item.isDroppedFromForward ? (
                              <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                Đã hủy: {item.dropReason}
                              </span>
                            ) : item.forwardedQuantity < item.quantity ? (
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Cung cấp thiếu
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Đầy đủ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ingredients Table */}
            {(order.ingredientItems || []).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  Danh sách nguyên liệu ({order.ingredientItems.length})
                </h3>
                <div className="border rounded-xl overflow-hidden border-blue-100 bg-blue-50/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <th className="px-4 py-2 text-left font-medium">Nguyên liệu</th>
                        <th className="px-4 py-2 text-center font-medium">Yêu cầu</th>
                        <th className="px-4 py-2 text-center font-medium">Thực giao</th>
                        <th className="px-4 py-2 text-left font-medium">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {(order.ingredientItems || []).map((item) => (
                        <tr key={item.ingredientId} className="hover:bg-blue-50/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.ingredientName}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">
                            {item.forwardedQuantity} {item.unit}
                          </td>
                          <td className="px-4 py-3">
                            {item.isDroppedFromForward ? (
                              <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                Đã hủy: {item.dropReason}
                              </span>
                            ) : item.forwardedQuantity < item.quantity ? (
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Cung cấp thiếu
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Đầy đủ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary Processing Notes */}
            {(order.processingNote || order.forwardNote) && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-semibold">Ghi chú xử lý hệ thống</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.forwardNote && (
                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 text-sm">
                      <p className="font-medium text-orange-800 mb-1">Ghi chú điều phối:</p>
                      <p className="text-orange-700 italic">{order.forwardNote}</p>
                    </div>
                  )}
                  {order.processingNote && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
                      <p className="font-medium text-blue-800 mb-1">Ghi chú chuẩn bị:</p>
                      <p className="text-blue-700 italic">{order.processingNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HistoryOrderDetailModal;
