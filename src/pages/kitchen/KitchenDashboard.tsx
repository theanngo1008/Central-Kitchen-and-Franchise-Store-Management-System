import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKitchenDashboardOverview } from '@/hooks/dashboard/useKitchenDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatDateTime } from '@/utils/formatters';
import { format } from 'date-fns';
import { 
  ClipboardList, Factory, Package, AlertTriangle, 
  ArrowRight, Clock, RefreshCw, AlertCircle, CalendarRange
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, 'yyyy-MM-dd');
};
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const KitchenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>(getDaysAgo(6));
  const [toDate, setToDate] = useState<string>(getToday());

  const { data, isLoading, isError, refetch } = useKitchenDashboardOverview({
    fromDate,
    toDate,
    timezoneOffsetMinutes: new Date().getTimezoneOffset() * -1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Bếp" subtitle="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Bếp" subtitle="Lỗi kết nối" />
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
        title={`Trang chủ Bếp - ${data.centralKitchenName || 'Central Kitchen'}`}
        subtitle={`Quản lý hoạt động sản xuất cho ${data.managedFranchiseCount} cửa hàng`}
      />

      {/* Filters Section */}
      <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CalendarRange size={14} /> Từ ngày
          </label>
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
          title="Đơn hàng chờ xử lý"
          value={data.orderQueueSummary.receivedByKitchenCount.toString()}
          subtitle={`Trong tổng số ${data.orderQueueSummary.total} đơn`}
          icon={ClipboardList}
          variant="warning"
          onClick={() => navigate('/kitchen/orders')}
        />
        <MetricCard
          title="Kế hoạch chưa hoàn tất"
          value={data.productionPlanSummary.dueTodayOpenCount.toString()}
          subtitle={`${data.productionPlanSummary.overdueOpenCount} kế hoạch quá hạn`}
          icon={Factory}
          variant="primary"
          onClick={() => navigate('/kitchen/production')}
        />
        <MetricCard
          title="Sản lượng chờ đáp ứng"
          value={data.productionPlanSummary.totalPlannedQuantity.toString()}
          subtitle={`Hoàn thành: ${data.productionRunSummary.completedQuantity}`}
          icon={Package}
          variant="success"
          onClick={() => navigate('/kitchen/production')}
        />
        <MetricCard
          title="Công việc khẩn cấp"
          value={data.orderQueueSummary.overdueActionCount.toString()}
          subtitle="Các yêu cầu quá thời gian"
          icon={AlertTriangle}
          variant={data.orderQueueSummary.overdueActionCount > 0 ? "danger" : "default"}
          onClick={() => navigate('/kitchen/orders')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList size={20} className="text-primary" /> Việc cần làm (Priority Actions)
            </h2>
          </div>
          <div className="space-y-3 flex-1 overflow-auto max-h-[400px]">
            {data.priorityActions.length > 0 ? (
              data.priorityActions.map((action, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg bg-muted/30 border text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate('/kitchen/orders')}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-primary">{action.actionType}</span>
                    <span className="text-xs text-muted-foreground">#{action.relatedCode}</span>
                  </div>
                  <p className="text-muted-foreground">{action.message}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Không có việc khẩn cấp nào.
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle size={20} /> Cảnh báo Nguyên Liệu
            </h2>
            <Link
              to="/kitchen/inventory"
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
                      Tồn kho thấp ({data.lowStockAlerts.length})
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
                      Sắp hết hạn ({data.nearExpiryAlerts.length})
                    </h3>
                    <div className="space-y-2">
                      {data.nearExpiryAlerts.map(alert => (
                        <div key={alert.batchId} className="flex justify-between items-center bg-card border px-3 py-2 rounded-lg text-sm">
                          <div>
                            <p className="font-medium">{alert.ingredientName}</p>
                            <p className="text-xs text-muted-foreground">Lô: {alert.batchCode}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <Badge variant={(alert.daysToExpire ?? 99) <= 3 ? "destructive" : "secondary"}>
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
                <p className="text-sm">Không có cảnh báo tồn kho hoặc hết hạn</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;