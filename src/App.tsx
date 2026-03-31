import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
// Store Pages
import CreateOrderPage from "@/pages/store/CreateOrder";
import StoreDashboard from "@/pages/store/StoreDashboard";
import StoreOrderDetail from "@/pages/store/StoreOrderDetail";
import OrderList from "@/pages/store/OrderList";
import ReceiveGoods from "@/pages/store/ReceiveGoods";
import StoreInventory from "@/pages/store/StoreInventory";
// Kitchen Pages
import KitchenDashboard from "@/pages/kitchen/KitchenDashboard";
import IncomingOrders from "@/pages/kitchen/IncomingOrders";
import ProductionPlanning from "@/pages/kitchen/ProductionPlanning";
import ProductionSummary from "@/pages/kitchen/ProductionSummary";
import StorePackaging from "@/pages/kitchen/StorePackaging";
import KitchenInventory from "@/pages/kitchen/KitchenInventory/index";
import KitchenInventoryHistory from "@/pages/kitchen/KitchenInventoryHistory";
// Coordinator Pages
import CoordinatorDashboard from "@/pages/coordinator/CoordinatorDashboard";
import AggregatedOrders from "@/pages/coordinator/AggregatedOrders";
import ProductionCoordination from "@/pages/coordinator/ProductionCoordination";
import SupplyQueue from "@/pages/coordinator/SupplyQueue";
import DeliveryTracking from "@/pages/coordinator/DeliveryTracking";
import ExceptionHandling from "@/pages/coordinator/ExceptionHandling";
// Manager Pages
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ProductManagement from "@/pages/manager/ProductManagement";
import RecipeManagement from "@/pages/manager/RecipeManagement";
import InventoryOverview from "@/pages/manager/InventoryOverview";
import Reports from "@/pages/manager/Reports";
import IngredientManagement from "@/pages/manager/IngredientManagement";
import StoreCatalogManagement from "@/pages/manager/StoreCatalogManagement";
import SupplierManagement from "@/pages/manager/SupplierManagement";
// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";

import FranchiseDetail from "@/pages/admin/FranchiseManagement/FranchiseDetail";

import SystemConfig from "@/pages/admin/SystemConfig";
import LocationManagement from "@/pages/admin/LocationManagement";
import SystemReports from "@/pages/admin/SystemReports";
import RbacManagement from "@/pages/admin/RbacManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route element={<MainLayout />}>
              <Route path="/profile" element={<Profile />} />

              {/* Store Routes */}
              <Route path="/stores/:storeId" element={<StoreDashboard />} />
              <Route
                path="/stores/:storeId/orders/new"
                element={<CreateOrderPage />}
              />
              <Route
                path="/stores/:storeId/orders/:orderId/edit"
                element={<CreateOrderPage />}
              />
              <Route path="/stores/:storeId/orders" element={<OrderList />} />
              <Route
                path="/stores/:storeId/receive"
                element={<ReceiveGoods />}
              />
              <Route
                path="/stores/:storeId/inventory"
                element={<StoreInventory />}
              />
              <Route
                path="/stores/:storeId/orders/:orderId"
                element={<StoreOrderDetail />}
              />
              {/* Kitchen Routes */}
              <Route path="/kitchen" element={<KitchenDashboard />} />
              <Route path="/kitchen/orders" element={<IncomingOrders />} />
              <Route
                path="/kitchen/production-summary"
                element={<ProductionSummary />}
              />
              <Route
                path="/kitchen/production"
                element={<ProductionPlanning />}
              />
              <Route path="/kitchen/packaging" element={<StorePackaging />} />
              <Route path="/kitchen/inventory" element={<KitchenInventory />} />

              <Route
                path="/kitchen/inventory-history"
                element={<KitchenInventoryHistory />}
              />
              {/* Coordinator Routes */}
              <Route path="/coordinator" element={<CoordinatorDashboard />} />
              <Route
                path="/coordinator/orders"
                element={<AggregatedOrders />}
              />
              <Route
                path="/coordinator/coordination"
                element={<ProductionCoordination />}
              />
              <Route
                path="/coordinator/supply-queue"
                element={<SupplyQueue />}
              />
              <Route
                path="/coordinator/tracking"
                element={<DeliveryTracking />}
              />
              <Route
                path="/coordinator/exceptions"
                element={<ExceptionHandling />}
              />
              {/* Manager Routes */}
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/products" element={<ProductManagement />} />
              <Route path="/manager/recipes" element={<RecipeManagement />} />
              <Route
                path="/manager/inventory"
                element={<InventoryOverview />}
              />
              <Route path="/manager/reports" element={<Reports />} />
              <Route
                path="/manager/ingredients"
                element={<IngredientManagement />}
              />
              <Route
                path="/manager/store-catalog"
                element={<StoreCatalogManagement />}
              />
              <Route
                path="/manager/suppliers"
                element={<SupplierManagement />}
              />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />

              <Route
                path="/admin/franchises/:franchiseId"
                element={<FranchiseDetail />}
              />

              <Route path="/admin/rbac" element={<RbacManagement />} />
              <Route path="/admin/config" element={<SystemConfig />} />
              <Route path="/admin/locations" element={<LocationManagement />} />
              <Route path="/admin/reports" element={<SystemReports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
