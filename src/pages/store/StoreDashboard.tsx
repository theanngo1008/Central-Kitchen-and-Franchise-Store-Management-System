import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockOrders, mockProducts } from "@/data/mockData";
import {
  ShoppingCart,
  Package,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const storeOrders = mockOrders.filter(
    (o) => o.storeName === "Chi nhánh Quận 1",
  );
  const pendingOrders = storeOrders.filter(
    (o) => o.status === "pending",
  ).length;
  const processingOrders = storeOrders.filter(
    (o) => o.status === "processing",
  ).length;
  const lowStockItems = mockProducts.filter(
    (p) => p.stock <= p.minStock,
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Trang chủ Cửa hàng"
        action={{
          label: "Tạo đơn hàng",
          icon: ShoppingCart,
          onClick: () => navigate(`/stores/${storeId}/orders/new`),
        }}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Đơn chờ xử lý"
          value={pendingOrders}
          subtitle="Đang chờ bếp xử lý"
          icon={ClipboardList}
          variant="warning"
        />
        <MetricCard
          title="Đang xử lý"
          value={processingOrders}
          subtitle="Đang được chuẩn bị"
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Tồn kho thấp"
          value={lowStockItems}
          subtitle="Cần đặt hàng bổ sung"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="Tổng đơn (tháng)"
          value={12}
          subtitle="Tháng này"
          icon={ShoppingCart}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
            <Link
              to={`/stores/${storeId}/orders`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {storeOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cảnh báo tồn kho</h2>
            <Link
              to={`/stores/${storeId}/inventory`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Xem tồn kho <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {mockProducts
              .filter((p) => p.stock <= p.minStock * 1.5)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${product.stock <= product.minStock ? "text-destructive" : "text-warning"}`}
                    >
                      {product.stock} {product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tối thiểu: {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;
