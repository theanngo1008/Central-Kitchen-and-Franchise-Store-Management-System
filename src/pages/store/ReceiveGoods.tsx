import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, ClipboardList, Loader2, Package, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  usePendingReceivings, 
  useReceivingDetail, 
  useConfirmReceiving 
} from '@/hooks/store/useReceiving';
import { authApi } from '@/api';

const ReceivingDetailModal: React.FC<{
  franchiseId: number;
  deliveryId: number | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ franchiseId, deliveryId, isOpen, onClose }) => {
  const { data: detail, isLoading, isError } = useReceivingDetail(
    franchiseId,
    deliveryId
  );
  const confirmMutation = useConfirmReceiving();
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!deliveryId) return;
    confirmMutation.mutate(
      { franchiseId, deliveryId, data: { note } },
      { 
        onSuccess: () => {
          onClose();
          setNote('');
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết nhận hàng - {detail?.deliveryCode}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : isError || !detail ? (
          <div className="text-center text-destructive p-4">Lỗi khi tải thông tin chi tiết.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg">
              <div>
                <p className="text-muted-foreground">Bếp cung cấp</p>
                <p className="font-medium">{detail.centralKitchenName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ngày giao dự kiến</p>
                <p className="font-medium">{detail.planDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="text-muted-foreground">Mã đơn liên kết</p>
                <p className="font-medium">{detail.orderCode || 'Không có'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Danh sách sản phẩm / nguyên liệu</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Tên mặt hàng</th>
                      <th className="px-4 py-2 text-left font-medium">Phân loại</th>
                      <th className="px-4 py-2 text-center font-medium">Số lượng giao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium">{item.itemName}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.itemType === 'PRODUCT' ? 'Thành phẩm' : 'Nguyên liệu'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.deliveredQuantity} <span className="text-muted-foreground">{item.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ghi chú nhận hàng</Label>
              <Textarea
                placeholder="VD: Đã nhận đủ hàng, tình trạng tốt..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={confirmMutation.isPending}>Đóng</Button>
              <Button 
                onClick={handleConfirm} 
                disabled={detail.status === 'RECEIVED' || confirmMutation.isPending}
              >
                {confirmMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Xác nhận đã nhận đủ hàng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ReceiveGoods: React.FC = () => {
  const user = authApi.getCurrentUser();
  const franchiseId = user?.franchiseId ? Number(user.franchiseId) : undefined;

  const { data: rawData, isLoading, isError, refetch } = usePendingReceivings(franchiseId!);

  // Explicit array fallback in case data wraps strangely or is undefined
  const receivings = Array.isArray(rawData) ? rawData : [];

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

  if (!franchiseId) {
    return <div className="p-8 text-center">Không tìm thấy mã Cửa hàng.</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách chờ nhận...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">Không thể tải dữ liệu.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader 
        title="Nhận hàng" 
        subtitle="Kiểm tra và xác nhận các chuyến giao hàng từ Bếp Trung Tâm"
      />

      {receivings.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không có đơn hàng chờ nhận</h3>
          <p className="text-muted-foreground">Tất cả đơn hàng đã được cửa hàng xác nhận.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {receivings.map((receiving) => (
            <div key={receiving.receivingId} className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4 border-b pb-4">
                <div>
                  <span className="font-semibold text-lg">{receiving.deliveryCode}</span>
                  {receiving.orderCode && (
                    <p className="text-xs text-muted-foreground mt-1">Order: {receiving.orderCode}</p>
                  )}
                </div>
                <StatusBadge status={receiving.status} />
              </div>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
                  <span className="text-muted-foreground flex items-center gap-2"><Package size={14} /> Tổng món</span>
                  <span className="font-medium">{receiving.totalItems} (SL: {receiving.totalQuantity})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngày giao kế hoạch</span>
                  <span>{receiving.planDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2"><ClipboardList size={14} /> Bếp cung cấp</span>
                  <span className="text-right truncate max-w-[150px]" title={receiving.centralKitchenName}>
                    {receiving.centralKitchenName}
                  </span>
                </div>
              </div>

              <Button 
                variant="default"
                className="w-full" 
                onClick={() => setSelectedDeliveryId(receiving.receivingId)}
              >
                Chi tiết & Nhận hàng
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ReceivingDetailModal
        franchiseId={franchiseId!}
        deliveryId={selectedDeliveryId}
        isOpen={!!selectedDeliveryId}
        onClose={() => setSelectedDeliveryId(null)}
      />
    </div>
  );
};

export default ReceiveGoods;