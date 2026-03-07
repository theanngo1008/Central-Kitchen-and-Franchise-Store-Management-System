import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mockOrders, Order } from '@/data/mockData';
import { Check, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ReceiveGoods: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  
  // Orders that are delivered and awaiting confirmation
  const deliveredOrders = mockOrders.filter(o => 
    o.storeName === 'Chi nhánh Quận 1' && o.status === 'delivered'
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleConfirmReceipt = () => {
    toast.success('Đã xác nhận nhận hàng và gửi đánh giá!');
    setSelectedOrder(null);
    setFeedback('');
    setRating(5);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Nhận hàng" 
        subtitle="Xác nhận nhận hàng và đánh giá chất lượng"
      />

      {deliveredOrders.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không có đơn hàng chờ nhận</h3>
          <p className="text-muted-foreground">Tất cả đơn hàng đã được xác nhận.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveredOrders.map((order) => (
            <div key={order.id} className="bg-card rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{order.id}</span>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày giao</span>
                  <span>{order.deliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số sản phẩm</span>
                  <span>{order.items.length} sản phẩm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                {order.items.slice(0, 2).map((item, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    • {item.productName} ({item.quantity} {item.unit})
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-muted-foreground">
                    +{order.items.length - 2} sản phẩm khác
                  </p>
                )}
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={() => setSelectedOrder(order)}
              >
                <Check size={16} className="mr-2" />
                Xác nhận nhận hàng
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nhận hàng - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Đánh giá chất lượng</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${star <= rating ? 'text-warning' : 'text-muted-foreground'}`}
                  >
                    <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="feedback">Nhận xét chất lượng (Tùy chọn)</Label>
              <Textarea
                id="feedback"
                placeholder="Nhận xét về chất lượng, đóng gói, tình trạng sản phẩm..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                Huỷ
              </Button>
              <Button className="flex-1" onClick={handleConfirmReceipt}>
                <Check size={16} className="mr-2" />
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiveGoods;