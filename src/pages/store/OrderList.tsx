import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockOrders, Order } from '@/data/mockData';
import { Search, Eye, ClipboardList, Package, CheckCircle2, Clock3 } from 'lucide-react';

const OrderList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const storeOrders = useMemo(() => {
    return mockOrders.filter((o) => o.storeName === 'Chi nhánh Quận 1');
  }, []);

  const filteredOrders = useMemo(() => {
    return storeOrders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.storeName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ? true : order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [storeOrders, search, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const columns = [
    {
      key: 'id',
      label: 'Mã đơn',
      render: (order: Order) => <span className="font-medium">{order.id}</span>,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
    },
    {
      key: 'deliveryDate',
      label: 'Ngày giao',
    },
    {
      key: 'itemsCount',
      label: 'Số món',
      render: (order: Order) => `${order.items.length} sản phẩm`,
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (order: Order) => (
        <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (order: Order) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
          <Eye size={16} className="mr-2" />
          Xem
        </Button>
      ),
    },
  ];

  const pendingCount = storeOrders.filter((o) => o.status === 'pending').length;
  const processingCount = storeOrders.filter((o) => o.status === 'processing').length;
  const deliveredCount = storeOrders.filter((o) => o.status === 'delivered').length;
  const totalOrders = storeOrders.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danh sách đơn hàng"
        subtitle="Theo dõi toàn bộ đơn hàng của Chi nhánh Quận 1"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm theo mã đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <Label htmlFor="statusFilter" className="mb-2 block">
            Trạng thái
          </Label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
            <ClipboardList size={18} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Chờ xử lý</p>
            <Clock3 size={18} className="text-warning" />
          </div>
          <p className="text-2xl font-semibold">{pendingCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Đang xử lý</p>
            <Package size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{processingCount}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Đã giao</p>
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{deliveredCount}</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredOrders} />

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đơn</span>
                    <span className="font-medium">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày tạo</span>
                    <span>{selectedOrder.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày giao</span>
                    <span>{selectedOrder.deliveryDate}</span>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cửa hàng</span>
                    <span>{selectedOrder.storeName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền</span>
                    <span className="font-medium">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Danh sách sản phẩm</h3>
                <div className="border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/40 text-sm font-medium">
                    <div className="col-span-5">Sản phẩm</div>
                    <div className="col-span-3 text-center">Số lượng</div>
                    <div className="col-span-2 text-center">Đơn vị</div>
                    <div className="col-span-2 text-right">Ghi chú</div>
                  </div>

                  <div className="divide-y">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
                      >
                        <div className="col-span-5 font-medium">{item.productName}</div>
                        <div className="col-span-3 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-center">{item.unit}</div>
                        <div className="col-span-2 text-right text-muted-foreground">
                          -
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;