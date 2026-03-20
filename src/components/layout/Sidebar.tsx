import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, getRoleDisplayName, UserRole } from "@/contexts/AuthContext";
import { authApi } from "@/api";
import { useLogout } from "@/hooks/auth";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  Truck,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Factory,
  Calendar,
  AlertTriangle,
  BookOpen,
  Store,
  Shield,
  FileText,
  Warehouse,
  User,
  Coffee,
  Layers,
  PackageCheck,
  Leaf,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItems = (
  role: UserRole,
  franchiseId?: string | null,
): NavItem[] => {
  const items: Record<UserRole, NavItem[]> = {
    franchise_store: [
      {
        label: "Trang chủ",
        path: `/stores/${franchiseId}`,
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Tạo đơn hàng",
        path: `/stores/${franchiseId}/orders/new`,
        icon: <ShoppingCart size={20} />,
      },
      {
        label: "Đơn hàng của tôi",
        path: `/stores/${franchiseId}/orders`,
        icon: <ClipboardList size={20} />,
      },
      {
        label: "Nhận hàng",
        path: `/stores/${franchiseId}/receive`,
        icon: <Package size={20} />,
      },
      {
        label: "Tồn kho cửa hàng",
        path: `/stores/${franchiseId}/inventory`,
        icon: <Warehouse size={20} />,
      },
    ],
    central_kitchen: [
      {
        label: "Trang chủ",
        path: "/kitchen",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Đơn hàng đến",
        path: "/kitchen/orders",
        icon: <ClipboardList size={20} />,
      },
      {
        label: "Tổng hợp đơn SX",
        path: "/kitchen/production-summary",
        icon: <Layers size={20} />,
      },
      {
        label: "Kế hoạch sản xuất",
        path: "/kitchen/production",
        icon: <Factory size={20} />,
      },
      {
        label: "Đóng gói cửa hàng",
        path: "/kitchen/packaging",
        icon: <PackageCheck size={20} />,
      },
      {
        label: "Tồn kho",
        path: "/kitchen/inventory",
        icon: <Warehouse size={20} />,
      },
    ],
    supply_coordinator: [
      {
        label: "Trang chủ",
        path: "/coordinator",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Tổng hợp đơn hàng",
        path: "/coordinator/orders",
        icon: <ClipboardList size={20} />,
      },
      {
        label: "Điều phối",
        path: "/coordinator/coordination",
        icon: <Factory size={20} />,
      },
      {
        label: "Hàng chờ xuất kho",
        path: "/coordinator/supply-queue",
        icon: <Package size={20} />,
      },
      {
        label: "Theo dõi giao hàng",
        path: "/coordinator/tracking",
        icon: <Truck size={20} />,
      },
      {
        label: "Xử lý sự cố",
        path: "/coordinator/exceptions",
        icon: <AlertTriangle size={20} />,
      },
    ],
    manager: [
      { label: 'Trang chủ', path: '/manager', icon: <LayoutDashboard size={20} /> },
      { label: 'Menu trà sữa', path: '/manager/products', icon: <Coffee size={20} /> },
      { label: 'Nguyên vật liệu', path: '/manager/ingredients', icon: <Leaf size={20} /> },
      { label: 'Nhà cung cấp', path: '/manager/suppliers', icon: <Truck size={20} /> },
      { label: 'Danh mục cửa hàng', path: '/manager/store-catalog', icon: <Store size={20} /> },
      { label: 'Công thức & BOM', path: '/manager/recipes', icon: <BookOpen size={20} /> },
      { label: 'Tồn kho tổng', path: '/manager/inventory', icon: <Warehouse size={20} /> },
    ],
    admin: [
      {
        label: "Trang chủ",
        path: "/admin",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Quản lý người dùng",
        path: "/admin/users",
        icon: <Users size={20} />,
      },
      { label: "Phân quyền", path: "/admin/rbac", icon: <Shield size={20} /> },
      {
        label: "Cấu hình hệ thống",
        path: "/admin/config",
        icon: <Settings size={20} />,
      },
      {
        label: "Cửa hàng & Bếp",
        path: "/admin/locations",
        icon: <Store size={20} />,
      },
      {
        label: "Báo cáo tổng hợp",
        path: "/admin/reports",
        icon: <FileText size={20} />,
      },
    ],
  };

  return items[role] || [];
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const location = useLocation();

  if (!user) return null;

  const currentUser = authApi.getCurrentUser();
  const franchiseId = currentUser?.franchiseId;

  const navItems = getNavItems(user.role, franchiseId);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Coffee className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-accent-foreground">
              Trà Sữa Pro
            </h1>
            <p className="text-xs text-sidebar-foreground">Bếp Trung Tâm</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors mb-2"
        >
          <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-sidebar-foreground truncate">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        </Link>
        <button
          onClick={logout}
          className="nav-item w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
