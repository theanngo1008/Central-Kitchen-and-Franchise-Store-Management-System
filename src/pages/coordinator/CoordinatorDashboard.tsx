import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupplyDashboardOverview } from '@/hooks/dashboard/useSupplyDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatDateTime } from '@/utils/formatters';
import { format } from 'date-fns';
import { 
  ClipboardList, Truck, AlertTriangle, Calendar, PackageMinus,
  ArrowRight, Clock, RefreshCw, AlertCircle, CalendarRange
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, 'yyyy-MM-dd');
};
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const CoordinatorDashboard: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(getDaysAgo(6));
  const [toDate, setToDate] = useState<string>(getToday());

  const { data, isLoading, isError, refetch } = useSupplyDashboardOverview({
    fromDate,
    toDate,
    timezoneOffsetMinutes: new Date().getTimezoneOffset() * -1,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Điều phối" subtitle="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Điều phối" subtitle="Lỗi kết nối" />
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
        title={`Trang chủ Điều phối - ${data.centralKitchenName || 'Supply'}`} 
        subtitle={`Khu vực cung ứng: ${data.managedFranchiseCount} cửa hàng`} 
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
          title="Đơn chờ chuẩn bị"
          value={data.orderStatusSummary.forwardedToSupplyCount.toString()}
          subtitle={`Trong tổng số ${data.orderStatusSummary.total} đơn mới`}
          icon={ClipboardList}
          variant="warning"
        />
        <MetricCard
          title="Đơn đang chuẩn bị"
          value={data.orderStatusSummary.preparingCount.toString()}
          subtitle={`Sẵn sàng: ${data.orderStatusSummary.readyToDeliverCount} đơn`}
          icon={Calendar}
          variant="primary"
        />
        <MetricCard
          title="Đơn đang giao"
          value={data.orderStatusSummary.inTransitCount.toString()}
          subtitle={`${data.orderStatusSummary.deliveredCount} đơn đã giao`}
          icon={Truck}
          variant="success"
        />
        <MetricCard
          title="Sự cố & Hủy món"
          value={data.droppedLineSummary.droppedLinesCount.toString()}
          subtitle={`Từ ${data.droppedLineSummary.ordersWithDroppedLinesCount} đơn bị thiếu`}
          icon={PackageMinus}
          variant={data.droppedLineSummary.droppedLinesCount > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning" /> Việc cần xử lý khẩn cấp
            </h2>
          </div>
          <div className="space-y-3 flex-1 overflow-auto max-h-[400px]">
            {data.priorityActions.length > 0 ? (
              data.priorityActions.map((action, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30 border text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-primary">{action.actionType}</span>
                    <span className="text-xs text-muted-foreground">
                      <Clock size={12} className="inline mr-0.5" /> 
                      {action.occurredAtUtc ? formatDateTime(action.occurredAtUtc) : action.businessDate}
                    </span>
                  </div>
                  <p className="font-medium">{action.franchiseName} - #{action.orderCode}</p>
                  <p className="text-muted-foreground mt-1">{action.message}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Đã xử lý xong toàn bộ tác vụ ưu tiên.
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Progress KPI View */}
        <div className="bg-card rounded-xl border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold border-b w-full pb-2">Tổng kết vận chuyển cửa hàng</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col justify-center items-center p-4 bg-muted/40 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">Chuyến giao chờ xác nhận</p>
              <p className="text-4xl font-semibold mt-2 text-warning">
                {data.deliveryStatusSummary.deliveredPendingReceivingCount}
              </p>
            </div>
            <div className="flex flex-col justify-center items-center p-4 bg-success/10 rounded-xl">
              <p className="text-sm text-muted-foreground text-center">Chuyến giao thành công</p>
              <p className="text-4xl font-semibold mt-2 text-success">
                {data.deliveryStatusSummary.confirmedReceivingCount}
              </p>
            </div>
            
            {/* Some extra stats derived from API */}
            <div className="col-span-2 mt-4 space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Tổng chuyến đã xuất</span>
                <span className="font-medium text-lg">{data.deliveryStatusSummary.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Cập nhật lúc</span>
                <span className="font-medium">
                  {data.receivingSummary.latestDeliveredAtUtc ? formatDateTime(data.receivingSummary.latestDeliveredAtUtc) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Phản hồi gần nhất</span>
                <span className="font-medium">
                  {data.receivingSummary.latestConfirmedAtUtc ? formatDateTime(data.receivingSummary.latestConfirmedAtUtc) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;