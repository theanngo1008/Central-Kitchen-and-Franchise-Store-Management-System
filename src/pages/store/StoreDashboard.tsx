import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStoreDashboardOverview } from '@/hooks/dashboard/useStoreDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/formatters';
import { format } from 'date-fns';
import { 
  ShoppingCart, Package, AlertTriangle, 
  ArrowRight, RefreshCw, AlertCircle, Clock, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, 'yyyy-MM-dd');
};
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState<string>(getDaysAgo(6));
  const [toDate, setToDate] = useState<string>(getToday());

  const { data, isLoading, isError, refetch } = useStoreDashboardOverview({
    fromDate,
    toDate,
    timezoneOffsetMinutes: new Date().getTimezoneOffset() * -1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Cửa hàng" subtitle="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Cửa hàng" subtitle="Lỗi kết nối" />
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold text-lg">Lỗi tải dữ liệu</h3>
          <p className="text-sm opacity-80 mt-1 mb-4">Không thể lấy thông tin tổng quan lúc này.</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title={`Trang chủ - ${data.franchiseName || 'Cửa hàng'}`}
        subtitle="Tổng quan bếp và đơn hàng"
        action={{
          label: 'Tạo đơn hàng',
          icon: ShoppingCart,
          onClick: () => navigate('/store/orders/new')
        }}
      />

      {/* Filters Section */}
      <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Từ ngày</label>
          <Input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            className="w-[160px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Đến ngày</label>
          <Input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            className="w-[160px]"
          />
        </div>
        <Button variant="outline" onClick={() => refetch()} className="ml-auto" size="icon">
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Đơn đang hoạt động"
          value={data.orderSummary.activeOrderCount.toString()}
          subtitle={`Trong tổng số ${data.orderSummary.total} đơn mới`}
          icon={ShoppingCart}
          variant="primary"
        />
        <MetricCard
          title="Chờ xác nhận nhập"
          value={data.receivingSummary.pendingConfirmationCount.toString()}
          subtitle={`${data.orderSummary.deliveredPendingReceivingCount} đơn đã giao đến`}
          icon={Truck}
          variant="warning"
        />
        <MetricCard
          title="Tồn kho thấp"
          value={data.inventorySummary.lowStockIngredientCount.toString()}
          subtitle="Nguyên liệu cần nhập thêm"
          icon={AlertTriangle}
          variant={data.inventorySummary.lowStockIngredientCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          title="Tổng mã tồn kho"
          value={(data.inventorySummary.ingredientItemCount + data.inventorySummary.productItemCount).toString()}
          subtitle={`${data.inventorySummary.ingredientItemCount} NL, ${data.inventorySummary.productItemCount} Sản phẩm`}
          icon={Package}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chuyến giao gần đây</h2>
            <Link
              to="/store/receive"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {data.recentDeliveries.length > 0 ? (
            <div className="space-y-3 flex-1">
              {data.recentDeliveries.map((delivery) => (
                <div
                  key={delivery.deliveryId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-primary">#{delivery.deliveryCode}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock size={12}/> Dự kiến: {formatDateTime(delivery.plannedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={delivery.status} />
                    <p className="text-sm text-muted-foreground mt-1">
                      {delivery.totalItems} món ({delivery.totalQuantity})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
              Không có chuyến giao hàng nào gần đây
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle size={20} /> Cảnh báo tồn kho / Hết hạn
            </h2>
            <Link
              to="/store/inventory"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Xem kho <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-auto max-h-[400px]">
            {data.lowStockAlerts.length > 0 || data.nearExpiryAlerts.length > 0 ? (
              <div className="space-y-4">
                {/* Low Stock */}
                {data.lowStockAlerts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-warning-foreground bg-warning/10 p-2 rounded">
                      Tồn kho dưới mức an toàn ({data.lowStockAlerts.length})
                    </h3>
                    <div className="space-y-2">
                      {data.lowStockAlerts.map(alert => (
                        <div key={alert.ingredientId} className="flex justify-between items-center bg-card border px-3 py-2 rounded-lg text-sm">
                          <span className="font-medium">{alert.ingredientName}</span>
                          <div className="text-right">
                            <span className="text-destructive font-bold">{alert.onHandQuantity}</span>
                            <span className="text-muted-foreground ml-1">/ {alert.safetyStock} {alert.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Expiry alerts */}
                {data.nearExpiryAlerts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-destructive-foreground bg-destructive/10 p-2 rounded">
                      Lô sắp hết hạn ({data.nearExpiryAlerts.length})
                    </h3>
                    <div className="space-y-2">
                      {data.nearExpiryAlerts.map(alert => (
                        <div key={alert.batchId} className="flex justify-between items-center bg-card border px-3 py-2 rounded-lg text-sm">
                          <div>
                            <p className="font-medium">{alert.ingredientName}</p>
                            <p className="text-xs text-muted-foreground">Lô: {alert.batchCode}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <Badge variant={alert.daysToExpire && alert.daysToExpire <= 3 ? "destructive" : "secondary"}>
                              Còn {alert.daysToExpire} ngày
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <Package size={48} className="opacity-20 mb-4" />
                <p>Kho hàng đang ở trạng thái tốt</p>
                <p className="text-sm">Không có cảnh báo nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
