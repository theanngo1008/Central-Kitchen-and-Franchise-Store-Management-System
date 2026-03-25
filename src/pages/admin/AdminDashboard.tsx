import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { useAdminDashboardOverview } from '@/hooks/admin/useAdminDashboard';
import { 
  Users, 
  Store, 
  Shield, 
  Settings, 
  Calendar,
  AlertCircle,
  AlertTriangle,
  FileText,
  Activity,
  Server
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Date helpers
const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, 'yyyy-MM-dd');
};
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--muted-foreground))'];

const AdminDashboard: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(getDaysAgo(6));
  const [toDate, setToDate] = useState<string>(getToday());
  const [top, setTop] = useState<number>(10);

  const { data, isLoading, isError } = useAdminDashboardOverview({
    fromDate,
    toDate,
    top,
    timezoneOffsetMinutes: new Date().getTimezoneOffset() * -1
  });

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Quản trị" subtitle="Đang tải dữ liệu hệ thống..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Quản trị" subtitle="Tổng quan hệ thống phân quyền" />
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold text-lg">Lỗi tải dữ liệu</h3>
          <p className="text-sm opacity-80 mt-1">Không thể lấy thông tin tổng quan lúc này.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const AUDIT_ACTION_MAP: Record<string, string> = {
    'STORE_ORDER_DELIVERY_STATUS_UPDATED': 'Cập nhật giao hàng',
    'STORE_ORDER_CREATE': 'Tạo đơn hàng',
    'STORE_ORDER_SUBMIT': 'Gửi đơn hàng',
    'RECEIVING_CONFIRM': 'Xác nhận nhận hàng',
    'STORE_ORDER_FORWARDED_TO_SUPPLY': 'Chuyển Cung ứng',
    'STORE_ORDER_LOCK': 'Khóa đơn hàng',
    'STORE_ORDER_PREPARED': 'Soạn đơn xong',
    'STORE_ORDER_RECEIVED_BY_KITCHEN': 'Bếp tiếp nhận',
  };

  const topActionsData = data.auditActivity.topActions.map(action => ({
    ...action,
    name: AUDIT_ACTION_MAP[action.name] || action.name,
  }));

  // Prepare workload chart data side-by-side
  const workloadData = [
    { 
      name: 'Đơn vị cửa hàng', 
      total: data.storeOrders.totalInRange,
      topStatus: data.storeOrders.topStatuses[0]?.count || 0,
      topStatusName: data.storeOrders.topStatuses[0]?.name || 'N/A'
    },
    { 
      name: 'Giao hàng', 
      total: data.deliveries.totalInRange,
      topStatus: data.deliveries.topStatuses[0]?.count || 0,
      topStatusName: data.deliveries.topStatuses[0]?.name || 'N/A'
    },
    { 
      name: 'Kế hoạch SX', 
      total: data.productionPlans.totalInRange,
      topStatus: data.productionPlans.topStatuses[0]?.count || 0,
      topStatusName: data.productionPlans.topStatuses[0]?.name || 'N/A'
    },
    { 
      name: 'Y/C Hỗ trợ', 
      total: data.supportRequests.totalInRange,
      topStatus: data.supportRequests.topStatuses[0]?.count || 0,
      topStatusName: data.supportRequests.topStatuses[0]?.name || 'N/A'
    }
  ];

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa có dữ liệu';
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Trang chủ Quản trị" subtitle="Quản trị tổng quan hệ thống toàn diện" />

      {/* Filters Section */}
      <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar size={14} /> Từ ngày
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Giới hạn Top N</label>
          <Input 
            type="number" 
            min={1} 
            max={50}
            value={top} 
            onChange={(e) => setTop(Number(e.target.value))} 
            className="w-[100px]"
          />
        </div>
      </div>

      {/* Notes / Alerts */}
      {data.notes && data.notes.length > 0 && (
        <div className="bg-warning/20 text-warning-foreground border border-warning/30 rounded-lg p-4 space-y-2">
          <div className="font-medium flex items-center gap-2">
            <AlertTriangle size={18} /> Lưu ý hệ thống:
          </div>
          <ul className="list-disc list-inside text-sm">
            {data.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Operational Snapshot */}
      <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-4 justify-around text-center items-center mb-6">
          <div className="flex-1 min-w-[150px]">
            <p className="text-sm text-muted-foreground">Đơn Đặt Mở</p>
            <p className="text-3xl font-bold text-primary">{data.operationalSnapshot.openStoreOrdersCount}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-sm text-muted-foreground">KH Sản Xuất Active</p>
            <p className="text-3xl font-bold text-warning">{data.operationalSnapshot.activeProductionPlansCount}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-sm text-muted-foreground">Chuyến Giao Mở</p>
            <p className="text-3xl font-bold text-info">{data.operationalSnapshot.openDeliveriesCount}</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <p className="text-sm text-muted-foreground">Chờ Xác Nhận Nhận</p>
            <p className="text-3xl font-bold text-success">{data.operationalSnapshot.pendingReceivingCount}</p>
          </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Cửa hàng / Store" 
          value={data.franchiseSummary.total.toString()} 
          subtitle={`${data.franchiseSummary.active} Hoạt động | ${data.franchiseSummary.inactive} Vô hiệu`} 
          icon={Store} 
          variant="success" 
        />
        <MetricCard 
          title="Bếp Trung Tâm / CK" 
          value={data.centralKitchenSummary.total.toString()} 
          subtitle={`${data.centralKitchenSummary.active} Hoạt động | ${data.centralKitchenSummary.inactive} Vô hiệu`} 
          icon={Store} 
          variant="warning" 
        />
        <MetricCard 
          title="Hồ sơ tài khoản" 
          value={data.userSummary.total.toString()} 
          subtitle={`${data.userSummary.active} Hoạt động | ${data.userSummary.inactive} Khóa`} 
          icon={Users} 
          variant="primary" 
        />
        <MetricCard 
          title="Phân quyền (RBAC)" 
          value={data.rbacSummary.roleActiveCount.toString()} 
          subtitle={`${data.rbacSummary.permissionActiveCount} Nhóm quyền | ${data.rbacSummary.rolePermissionLinkCount} Liên kết`} 
          icon={Shield} 
          variant="default" 
        />
      </div>

      {/* Roles Breakdown */}
      <div className="bg-card rounded-xl border p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Users size={16} className="text-primary"/> Chi tiết tài khoản Active theo Vai trò
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.userSummary.activeUsersByRole).map(([role, count]) => (
            <div key={role} className="px-3 py-1.5 bg-muted rounded-md text-sm border flex items-center gap-2">
              <span className="font-medium">{role}:</span>
              <span className="text-primary font-bold">{count}</span>
            </div>
          ))}
          {Object.keys(data.userSummary.activeUsersByRole).length === 0 && (
            <div className="text-sm text-muted-foreground">Không có dữ liệu vai trò.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Audit Actions Chart */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2"><Activity size={18}/> Top thao tác Audit</h2>
              <p className="text-sm text-muted-foreground">Tổng lượt: {data.auditActivity.totalInRange}</p>
            </div>
          </div>
          <div className="h-64">
            {topActionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topActionsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', background: 'hsl(var(--card))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Lần thực hiện"/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Không có dữ liệu Log</div>
            )}
          </div>
        </div>

        {/* Workload Status Chart */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={18}/> Backlog Workload</h2>
              <p className="text-sm text-muted-foreground">Tổng quan quá trình vận hành</p>
            </div>
          </div>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px', background: 'hsl(var(--card))' }} />
                  <Legend />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Tổng phiếu" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="topStatus" fill="hsl(var(--warning))" name="Top Status (Số lượng)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Data Freshness Timestamps */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex items-center gap-2">
          <Server size={18}/>
          <h3 className="font-semibold">Mức độ cập nhật dữ liệu (Data Freshness)</h3>
        </div>
        <div className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border">
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Thiết lập Cửa hàng (Franchises)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestFranchiseUpdatedAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Thiết lập Bếp trung tâm (CK)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestCentralKitchenUpdatedAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Cập nhật Tài khoản (Users)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestUserUpdatedAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Đơn đặt hàng Store (Orders)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestStoreOrderAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Giao hàng (Deliveries)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestDeliveryAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Kế hoạch sản xuất (Production)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestProductionPlanAtUtc)}</p>
            </div>
            <div className="p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">Yêu cầu hỗ trợ (Support Request)</p>
              <p className="font-medium text-sm">{formatDateTime(data.dataFreshness.latestSupportRequestAtUtc)}</p>
            </div>
            <div className="p-4 bg-card xl:col-span-2 flex items-center gap-3">
              <Activity className="text-primary/70" size={24}/>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Log Audit Gần nhất</p>
                <p className="font-medium text-sm text-primary">{formatDateTime(data.dataFreshness.latestAuditLogAtUtc)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;