import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useSupplyQueue,
  usePrepareDelivery,
  useUpdateDeliveryStatus
} from '@/hooks/coordinator/useSupplyQueue';
import { FlaskConical } from 'lucide-react';
import { SupplyOrderQueueItemResponse } from '@/types/supply';
import { 
  Package, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw,
  Truck,
  Box,
  CheckCircle,
  TruckIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SupplyQueue: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: response, isLoading, isError, refetch } = useSupplyQueue({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    sortDir: 'desc'
  });

  const prepareDeliveryMutation = usePrepareDelivery();
  const updateDeliveryStatusMutation = useUpdateDeliveryStatus();

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Modal States
  const [isPrepareModalOpen, setIsPrepareModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplyOrderQueueItemResponse | null>(null);
  const [note, setNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('');

  const orders = Array.isArray(response) ? response : [];
  const totalPages = 1;

  const toggleRow = (orderId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleOpenPrepareModal = (order: SupplyOrderQueueItemResponse) => {
    setSelectedOrder(order);
    setNote('');
    setIsPrepareModalOpen(true);
  };

  const handleOpenStatusModal = (order: SupplyOrderQueueItemResponse, nextStatus: string) => {
    setSelectedOrder(order);
    setTargetStatus(nextStatus);
    setNote('');
    setIsStatusModalOpen(true);
  };

  const confirmPrepareDelivery = () => {
    if (!selectedOrder) return;
    prepareDeliveryMutation.mutate(
      { orderId: selectedOrder.storeOrderId, data: { preparingNote: note } },
      { onSuccess: () => setIsPrepareModalOpen(false) }
    );
  };

  const confirmUpdateStatus = () => {
    if (!selectedOrder) return;
    updateDeliveryStatusMutation.mutate(
      { orderId: selectedOrder.storeOrderId, data: { status: targetStatus, statusNote: note } },
      { onSuccess: () => setIsStatusModalOpen(false) }
    );
  };

  const renderActionButtons = (order: SupplyOrderQueueItemResponse) => {
    switch (order.status) {
      case 'FORWARDED_TO_SUPPLY':
        return (
          <Button size="sm" onClick={() => handleOpenPrepareModal(order)}>
            <Box size={14} className="mr-1" /> Chuẩn bị giao hàng
          </Button>
        );
      case 'PREPARING':
        return (
          <Button size="sm" onClick={() => handleOpenStatusModal(order, 'READY_TO_DELIVER')} className="bg-blue-600 hover:bg-blue-700">
            <Package size={14} className="mr-1" /> Sẵn sàng giao
          </Button>
        );
      case 'READY_TO_DELIVER':
        return (
          <Button size="sm" onClick={() => handleOpenStatusModal(order, 'IN_TRANSIT')} className="bg-orange-500 hover:bg-orange-600">
            <TruckIcon size={14} className="mr-1" /> Bắt đầu giao
          </Button>
        );
      case 'IN_TRANSIT':
        return (
          <Button size="sm" onClick={() => handleOpenStatusModal(order, 'DELIVERED')} className="bg-green-600 hover:bg-green-700">
            <CheckCircle size={14} className="mr-1" /> Đã giao đến nơi
          </Button>
        );
      case 'DELIVERED':
        return (
          <Button size="sm" variant="outline" disabled>
            Hoàn tất giao hàng
          </Button>
        );
      default:
        return null; // Might be CANCELLED or other status
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in p-8 text-center text-muted-foreground">
        Đang tải danh sách hàng chờ xuất kho...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in p-8 text-center text-destructive">
        <p className="mb-4">Không thể tải dữ liệu.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Hàng Chờ Xuất Kho" 
        subtitle="Quản lý và điều phối các đơn hàng từ bếp trung tâm đến cửa hàng."
      />

      <div className="bg-card rounded-xl border p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Tìm mã đơn, cửa hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-sm">
                <th className="p-3 text-left font-medium w-12"></th>
                <th className="p-3 text-left font-medium">Mã Đơn</th>
                <th className="p-3 text-left font-medium">Cửa hàng</th>
                <th className="p-3 text-left font-medium">Ngày giao yêu cầu</th>
                <th className="p-3 text-center font-medium">Số lượng</th>
                <th className="p-3 text-left font-medium">Trạng thái</th>
                <th className="p-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Truck size={48} className="mx-auto mb-4 opacity-20" />
                    Không có đơn hàng nào trong hàng chờ
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.storeOrderId}>
                    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRow(order.storeOrderId)}
                        >
                          {expandedRows.has(order.storeOrderId) ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </Button>
                      </td>
                      <td className="p-3 font-medium">{order.orderCode}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{order.storeName}</p>
                          <p className="text-xs text-muted-foreground">ID: {order.storeId}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {order.requestedDeliveryDate}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {order.totalItems} món ({order.totalQuantity})
                          </span>
                          {(order.forwardedTotalQuantity > 0 || order.droppedTotalQuantity > 0) && (
                            <div className="flex gap-1 text-[10px]">
                              {order.forwardedTotalQuantity > 0 && (
                                <span className="text-green-600 font-medium">Giao: {order.forwardedTotalQuantity}</span>
                              )}
                              {order.droppedTotalQuantity > 0 && (
                                <span className="text-destructive font-medium">Hủy: {order.droppedTotalQuantity}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-3 text-right">
                        {renderActionButtons(order)}
                      </td>
                    </tr>
                    
                    {/* Expanded Items Details */}
                    {expandedRows.has(order.storeOrderId) && (
                      <tr className="bg-muted/10 border-b">
                        <td colSpan={7} className="p-4">
                          <div className="pl-12 space-y-4">
                            {/* Products */}
                            {order.items.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Chi tiết sản phẩm ({order.items.length})</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                      <div className="flex flex-col">
                                        <span>{item.productName} {item.sku ? `(${item.sku})` : ''}</span>
                                        {item.isDroppedFromForward && (
                                          <span className="text-[10px] text-destructive font-medium">Bị hủy: {item.dropReason || 'Không đủ tồn kho'}</span>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className="font-medium">{item.quantity} {item.unit}</span>
                                        {item.forwardedQuantity > 0 && item.forwardedQuantity < item.quantity && (
                                          <span className="text-[10px] text-green-600 font-medium">Giao: {item.forwardedQuantity} {item.unit}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Ingredients */}
                            {(order.ingredientItems ?? []).length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-blue-700">
                                  <FlaskConical size={14} /> Nguyên liệu ({order.ingredientItems!.length})
                                </h4>
                                <div className="space-y-2">
                                  {order.ingredientItems!.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-blue-100 last:border-0">
                                      <div className="flex flex-col">
                                        <span>{item.ingredientName}</span>
                                        {item.isDroppedFromForward && (
                                          <span className="text-[10px] text-destructive font-medium">Bị hủy: {item.dropReason || 'Không đủ tồn kho'}</span>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end">
                                        <span className="font-medium">{item.quantity} {item.unit}</span>
                                        {item.forwardedQuantity > 0 && item.forwardedQuantity < item.quantity && (
                                          <span className="text-[10px] text-green-600 font-medium">Giao: {item.forwardedQuantity} {item.unit}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Processing info */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Thông tin xử lý</h4>
                              <div className="p-3 bg-background rounded-lg border space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Người điều phối:</span> {order.forwardedBy || 'N/A'}</p>
                                <p><span className="text-muted-foreground">Ngày chuyển:</span> {order.forwardedAt ? new Date(order.forwardedAt).toLocaleString() : 'N/A'}</p>
                                {order.forwardNote && (
                                  <p><span className="text-muted-foreground">Ghi chú điều phối:</span> {order.forwardNote}</p>
                                )}
                                {order.processingNote && (
                                  <p><span className="text-muted-foreground">Ghi chú chuẩn bị:</span> {order.processingNote}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Setup */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Prepare Delivery Modal */}
      <Dialog open={isPrepareModalOpen} onOpenChange={setIsPrepareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuẩn bị giao hàng - {selectedOrder?.orderCode}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Vui lòng xác nhận kho đã bắt đầu gom hàng và chuẩn bị xuất kho cho đơn này.
            </p>
            <div className="space-y-2">
              <Label>Ghi chú chuẩn bị (Tùy chọn)</Label>
              <Textarea 
                placeholder="VD: Đã gom đủ hàng, chờ đóng gói..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrepareModalOpen(false)}>Hủy</Button>
            <Button onClick={confirmPrepareDelivery} disabled={prepareDeliveryMutation.isPending}>
              {prepareDeliveryMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Delivery Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái giao hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Chuyển trạng thái đơn <strong>{selectedOrder?.orderCode}</strong> thành <strong>{targetStatus}</strong>.
            </p>
            <div className="space-y-2">
              <Label>Ghi chú trạng thái (Tùy chọn)</Label>
              <Textarea 
                placeholder="VD: Xe sẽ đi lúc 08:30..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Hủy</Button>
            <Button onClick={confirmUpdateStatus} disabled={updateDeliveryStatusMutation.isPending}>
              {updateDeliveryStatusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplyQueue;
