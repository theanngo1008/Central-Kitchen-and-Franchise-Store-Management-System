import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

import { useDashboardOverview } from '@/hooks/dashboard/useDashboard';
import { adminFranchisesApi } from '@/api/admin/franchises.api';

// Date helpers
const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, 'yyyy-MM-dd');
};
const getToday = () => format(new Date(), 'yyyy-MM-dd');

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--muted-foreground))'];

const ManagerDashboard: React.FC = () => {
  // State for filters
  const [franchiseId, setFranchiseId] = useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = useState<string>(getDaysAgo(6));
  const [toDate, setToDate] = useState<string>(getToday());

  // Fetch franchises for the selector
  const { data: franchises } = useQuery({
    queryKey: ['franchises'],
    queryFn: adminFranchisesApi.list,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch dashboard data
  const { data, isLoading, isError, error } = useDashboardOverview(franchiseId, {
    fromDate,
    toDate,
    timezoneOffsetMinutes: new Date().getTimezoneOffset() * -1,
  });

  // Formatting helpers
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  // Render order status pie chart
  const orderData = useMemo(() => {
    if (!data?.orderStatusSummary.byStatus) return [];
    return Object.entries(data.orderStatusSummary.byStatus).map(([name, value]) => ({ name, value }));
  }, [data]);

  const deliveryData = useMemo(() => {
    if (!data?.deliveryStatusSummary.byStatus) return [];
    return Object.entries(data.deliveryStatusSummary.byStatus).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Trang chủ Quản lý" subtitle="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Determine if there is a 403 Forbidden error
  const isForbidden = isError && (error as any)?.response?.status === 403;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Trang chủ Quản lý" subtitle="Hiệu suất kinh doanh và phân tích vận hành" />

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
        <div className="space-y-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-muted-foreground">Chi nhánh</label>
          <Select 
            value={franchiseId === undefined ? 'all' : franchiseId.toString()} 
            onValueChange={(val) => setFranchiseId(val === 'all' ? undefined : Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả chi nhánh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {franchises?.map(f => (
                <SelectItem key={f.franchiseId} value={f.franchiseId.toString()}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isForbidden ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold text-lg">Bạn không có quyền xem cửa hàng này</h3>
          <p className="text-sm opacity-80 mt-1">Vui lòng chọn cửa hàng khác hoặc liên hệ quản trị viên.</p>
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <h3 className="font-semibold text-lg">Lỗi tải dữ liệu</h3>
          <p className="text-sm opacity-80 mt-1">Không thể lấy thông tin tổng quan lúc này.</p>
        </div>
      ) : data ? (
        <>
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Tổng đơn hàng" 
              value={data.orderStatusSummary.total.toString()} 
              subtitle={`Trong giai đoạn chọn${franchiseId ? '' : ` (${data.franchiseCount} cửa hàng)`}`} 
              icon={Package} 
              variant="default" 
            />
            <MetricCard 
              title="Tổng giao hàng" 
              value={data.deliveryStatusSummary.total.toString()} 
              subtitle={`${data.deliveryStatusSummary.deliveredCount} đã giao, ${data.deliveryStatusSummary.pendingCount} đang chờ`} 
              icon={TrendingUp} 
              variant="primary" 
            />
            <MetricCard 
              title="Giao đúng hạn" 
              value={formatPercent(data.serviceLevelSummary.onTimeRate)} 
              subtitle={`${data.serviceLevelSummary.onTimeDeliveredCount} / ${data.serviceLevelSummary.totalDeliveriesDeliveredInRange} chuyến`} 
              icon={Clock} 
              variant={data.serviceLevelSummary.onTimeRate >= 0.9 ? 'success' : 'warning'} 
            />
            <MetricCard 
              title="Cửa hàng hoạt động" 
              value={data.franchiseCount.toString()} 
              subtitle="Đang vận hành trong scope" 
              icon={BarChart3} 
              variant="success" 
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
              <div className="h-64">
                {orderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Không có dữ liệu</div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Trạng thái giao hàng</h2>
              <div className="h-64">
                {deliveryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deliveryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deliveryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Row */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-warning" /> Cảnh báo kho & vật tư
            </h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Low Stock Alerts */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Tồn kho thấp ({data.lowStockAlerts.length})</h3>
                </div>
                {data.lowStockAlerts.length > 0 ? (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/10 sticky top-0">
                        <TableRow>
                          <TableHead>Chi nhánh</TableHead>
                          <TableHead>Nguyên liệu</TableHead>
                          <TableHead className="text-right">SL Tồn</TableHead>
                          <TableHead className="text-right">An toàn</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.lowStockAlerts.map((alert, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{alert.franchiseName}</TableCell>
                            <TableCell>{alert.ingredientName}</TableCell>
                            <TableCell className="text-right text-destructive font-bold">
                              {alert.onHandQuantity} <span className="text-xs font-normal text-muted-foreground">{alert.unit}</span>
                            </TableCell>
                            <TableCell className="text-right">{alert.safetyStock}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Không có cảnh báo tồn kho thấp.</div>
                )}
              </div>

              {/* Near Expiry Alerts */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2">Sắp hết hạn ({data.nearExpiryAlerts.length})</h3>
                </div>
                {data.nearExpiryAlerts.length > 0 ? (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/10 sticky top-0">
                        <TableRow>
                          <TableHead>Chi nhánh</TableHead>
                          <TableHead>Lô / Nguyên liệu</TableHead>
                          <TableHead>Hạn sử dụng</TableHead>
                          <TableHead className="text-right">Còn lại</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.nearExpiryAlerts.map((alert, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{alert.franchiseName}</TableCell>
                            <TableCell>
                              <div>{alert.ingredientName}</div>
                              <div className="text-xs text-muted-foreground">{alert.batchCode} (SL: {alert.quantity}{alert.unit})</div>
                            </TableCell>
                            <TableCell>{format(new Date(alert.expiredAt), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={alert.daysToExpire <= 1 ? 'destructive' : 'secondary'} className={alert.daysToExpire > 1 ? "bg-warning text-warning-foreground hover:bg-warning/80" : ""}>
                                {alert.daysToExpire} ngày
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Không có cảnh báo sắp hết hạn.</div>
                )}
              </div>

              {/* Waste Alerts */}
              <div className="bg-card rounded-xl border overflow-hidden xl:col-span-2">
                <div className="p-4 bg-muted/30 border-b flex items-center gap-2">
                  <Trash2 size={18} className="text-destructive" />
                  <h3 className="font-semibold">Cảnh báo hao hụt / Waste ({data.wasteAlerts.length})</h3>
                </div>
                {data.wasteAlerts.length > 0 ? (
                  <div className="max-h-80 overflow-auto">
                    <Table>
                      <TableHeader className="bg-muted/10 sticky top-0">
                        <TableRow>
                          <TableHead>Chi nhánh</TableHead>
                          <TableHead>Nguyên liệu</TableHead>
                          <TableHead className="text-right">Slg Xuất</TableHead>
                          <TableHead className="text-right">Slg Hủy</TableHead>
                          <TableHead className="text-right">Tỷ lệ hủy</TableHead>
                          <TableHead className="text-right">Ngưỡng cho phép</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.wasteAlerts.map((alert, i) => (
                          <TableRow key={i} className={alert.isExceedThreshold ? 'bg-destructive/5' : ''}>
                            <TableCell className="font-medium">{alert.franchiseName}</TableCell>
                            <TableCell>{alert.ingredientName}</TableCell>
                            <TableCell className="text-right">{alert.issuedQuantity} {alert.unit}</TableCell>
                            <TableCell className="text-right text-destructive font-medium">{alert.wasteQuantity} {alert.unit}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={alert.isExceedThreshold ? 'destructive' : 'outline'}>
                                {formatPercent(alert.wasteRate)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatPercent(alert.wasteThreshold)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Không có cảnh báo hao hụt bất thường.</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ManagerDashboard;