import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  FlaskConical,
  BarChart3,
  Store,
} from "lucide-react";
import {
  useInventoryReport,
  useWastageReport,
  useStorePerformanceReport,
} from "@/hooks/reports/useReports";
import { reportsApi } from "@/api/manager/reportsApi";
import { adminFranchisesApi } from "@/api/admin/franchises.api";
import { adminCentralKitchensApi } from "@/api/admin/centralKitchens.api";
import { useAuth } from "@/contexts/AuthContext";

// ─── Helpers ────────────────────────────────────────────────────
const readBlobError = async (blob: Blob): Promise<string> => {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json.message || "Lỗi không xác định từ máy chủ.";
  } catch {
    return "Không thể tải báo cáo. Vui lòng thử lại.";
  }
};
const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const firstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(n);
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const onTimeLabel = (rate?: number | null) => {
  if (rate == null) return { label: "N/A", cls: "text-muted-foreground" };
  if (rate >= 95) return { label: "Xuất sắc", cls: "text-green-600" };
  if (rate >= 85) return { label: "Tốt", cls: "text-blue-600" };
  if (rate >= 70) return { label: "Trung bình", cls: "text-yellow-600" };
  return { label: "Chậm trễ", cls: "text-destructive" };
};

type Tab = "inventory" | "wastage" | "performance";

const ITEM_TYPE_LABELS: Record<string, string> = {
  INGREDIENT: "Nguyên liệu",
  PRODUCT: "Bán thành phẩm",
};

// ─── Component ──────────────────────────────────────────────────
const Reports: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === "manager" || user?.role === "admin";

  const franchiseId = useMemo(() => {
    if (isManager) return null;
    const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v && !Number.isNaN(Number(v))) return Number(v);
    }
    return null;
  }, [isManager]);

  const centralKitchenId = useMemo(() => {
    const v = localStorage.getItem("centralKitchenId");
    return v && !Number.isNaN(Number(v)) ? Number(v) : null;
  }, []);

  const [activeTab, setActiveTab] = useState<Tab>("inventory");
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(today());
  const [sortBy, setSortBy] = useState<"lostValue" | "wastedQuantity" | "wasteRate">("lostValue");

  // ── Scope state (for Manager/Admin) ──
  const [scopeType, setScopeType] = useState<"kitchen" | "franchise">("kitchen");
  const [selectedKitchenId, setSelectedKitchenId] = useState<number | null>(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null);
  const [orgs, setOrgs] = useState<{ kitchens: any[]; franchises: any[] }>({
    kitchens: [],
    franchises: [],
  });

  React.useEffect(() => {
    if (!isManager) return;
    const fetchOrgs = async () => {
      try {
        const [k, f] = await Promise.all([
          adminCentralKitchensApi.list(),
          adminFranchisesApi.list(),
        ]);
        setOrgs({ kitchens: k, franchises: f });
        if (k.length > 0) setSelectedKitchenId(k[0].centralKitchenId);
        if (f.length > 0) setSelectedFranchiseId(f[0].franchiseId);
      } catch (err) {
        console.error("[Reports] Failed to fetch orgs:", err);
      }
    };
    fetchOrgs();
  }, [isManager]);

  // ── Export state ──
  const now = new Date();
  const [exportYear, setExportYear] = useState(now.getFullYear());
  const [exportMonth, setExportMonth] = useState(now.getMonth() + 1);
  const [downloading, setDownloading] = useState<"store" | "kitchen" | null>(null);

  const handleDownloadStore = async () => {
    const targetId = isManager ? selectedFranchiseId : franchiseId;
    if (!targetId) {
      alert("Vui lòng chọn Cửa hàng để tải báo cáo.");
      return;
    }
    setDownloading("store");
    try {
      await reportsApi.downloadStoreMonthly({
        year: exportYear,
        month: exportMonth,
        franchiseId: targetId,
        timezoneOffsetMinutes: 420,
      });
    } catch (e: any) {
      console.error("[Export] store monthly:", e?.response?.data ?? e);
      const msg = e?.response?.data instanceof Blob ? await readBlobError(e.response.data) : (e?.response?.data?.message || "Lỗi tải file");
      alert(msg);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadKitchen = async () => {
    const targetId = isManager ? selectedKitchenId : centralKitchenId;
    if (!targetId) {
      alert("Vui lòng chọn Bếp Trung Tâm để tải báo cáo.");
      return;
    }
    setDownloading("kitchen");
    try {
      await reportsApi.downloadKitchenMonthly({
        year: exportYear,
        month: exportMonth,
        centralKitchenId: targetId,
        timezoneOffsetMinutes: 420,
      });
    } catch (e: any) {
      console.error("[Export] kitchen monthly:", e?.response?.data ?? e);
      const msg = e?.response?.data instanceof Blob ? await readBlobError(e.response.data) : (e?.response?.data?.message || "Lỗi tải file");
      alert(msg);
    } finally {
      setDownloading(null);
    }
  };

  // ── Inventory report ──
  const inventoryQuery = {
    fromDate,
    toDate,
    franchiseId: isManager 
      ? (scopeType === "franchise" ? (selectedFranchiseId ?? undefined) : undefined)
      : (franchiseId ?? undefined),
    centralKitchenId: isManager
      ? (scopeType === "kitchen" ? (selectedKitchenId ?? undefined) : undefined)
      : (centralKitchenId ?? undefined),
    timezoneOffsetMinutes: 420,
  };
  const {
    data: invData,
    isLoading: invLoading,
    refetch: refetchInv,
  } = useInventoryReport(
    inventoryQuery,
    activeTab === "inventory" &&
      (!isManager ||
        (scopeType === "kitchen" ? !!selectedKitchenId : !!selectedFranchiseId))
  );

  // ── Wastage report ──
  const wastageQuery = {
    ...inventoryQuery,
    sortBy,
  };
  const {
    data: wastageData,
    isLoading: wastageLoading,
    refetch: refetchWastage,
  } = useWastageReport(
    wastageQuery,
    activeTab === "wastage" &&
      (!isManager ||
        (scopeType === "kitchen" ? !!selectedKitchenId : !!selectedFranchiseId))
  );

  // ── Store Performance report ──
  const perfQuery = { fromDate, toDate, timezoneOffsetMinutes: 420 };
  const {
    data: perfData,
    isLoading: perfLoading,
    refetch: refetchPerf,
  } = useStorePerformanceReport(perfQuery, activeTab === "performance" && isManager);

  const invItems = invData?.data?.items ?? [];
  const wastageItems = wastageData?.data?.items ?? [];
  const perfItems = perfData?.data?.items ?? [];

  // Derived for inventory
  const invIngredients = invItems.filter((i) => i.itemType === "INGREDIENT");
  const invProducts = invItems.filter((i) => i.itemType === "PRODUCT");
  const totalClosingValue = invItems.reduce((s, i) => s + i.closingValue, 0);
  const totalWasted = invItems.reduce((s, i) => s + i.wastedQuantity, 0);

  // Derived for wastage chart
  const wastageChartData = wastageItems.slice(0, 8).map((i) => ({
    name: i.ingredientName.length > 12 ? i.ingredientName.slice(0, 12) + "…" : i.ingredientName,
    "Thiệt hại (đ)": i.totalLostValue,
    "Số lượng": i.wastedQuantity,
  }));

  const wasteReasonGroups = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of wastageItems) {
      map[i.wasteReason] = (map[i.wasteReason] ?? 0) + i.totalLostValue;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [wastageItems]);

  // Derived for performance chart
  const perfChartData = perfItems.map((i) => ({
    name:
      i.franchiseName.length > 14
        ? i.franchiseName.slice(0, 14) + "…"
        : i.franchiseName,
    "Sản phẩm": i.totalProductSpending,
    "Nguyên liệu": i.totalIngredientSpending,
    total: i.totalSpending,
  }));

  const handleRefresh = () => {
    if (activeTab === "inventory") refetchInv();
    if (activeTab === "wastage") refetchWastage();
    if (activeTab === "performance") refetchPerf();
  };

  const TABS = [
    { id: "inventory" as Tab, label: "Xuất - Nhập - Tồn", icon: Package },
    { id: "wastage" as Tab, label: "Báo cáo Hao hụt", icon: FlaskConical },
    ...(isManager
      ? [{ id: "performance" as Tab, label: "Hiệu suất Cửa hàng", icon: Store }]
      : []),
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Báo cáo & Phân tích"
        subtitle="Inventory, hao hụt và hiệu suất vận hành theo thời gian"
        action={{ label: "Refresh", icon: RefreshCw, onClick: handleRefresh }}
      />

      {/* Scope Selection (Manager/Admin only) */}
      {isManager && (
        <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Phạm vi báo cáo</label>
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setScopeType("kitchen")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  scopeType === "kitchen" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Bếp Trung Tâm
              </button>
              <button
                type="button"
                onClick={() => setScopeType("franchise")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  scopeType === "franchise" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Cửa hàng
              </button>
            </div>
          </div>

          {scopeType === "kitchen" ? (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground block mb-1">Chọn Bếp</label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm disabled:opacity-50"
                value={selectedKitchenId ?? ""}
                onChange={(e) => setSelectedKitchenId(Number(e.target.value))}
                disabled={orgs.kitchens.length === 0}
              >
                {orgs.kitchens.map((k) => (
                  <option key={k.centralKitchenId} value={k.centralKitchenId}>
                    {k.name}
                  </option>
                ))}
                {orgs.kitchens.length === 0 && <option>Đang tải danh sách bếp...</option>}
              </select>
            </div>
          ) : (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground block mb-1">Chọn Cửa hàng</label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm disabled:opacity-50"
                value={selectedFranchiseId ?? ""}
                onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
                disabled={orgs.franchises.length === 0}
              >
                {orgs.franchises.map((f) => (
                  <option key={f.franchiseId} value={f.franchiseId}>
                    {f.name}
                  </option>
                ))}
                {orgs.franchises.length === 0 && <option>Đang tải danh sách cửa hàng...</option>}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Từ ngày</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Đến ngày</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
        </div>
        {activeTab === "wastage" && (
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Sắp xếp theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="lostValue">Thiệt hại cao nhất</option>
              <option value="wastedQuantity">Số lượng hủy</option>
              <option value="wasteRate">Tỉ lệ hao hụt</option>
            </select>
          </div>
        )}
        <Button size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} className="mr-1.5" /> Tải báo cáo
        </Button>
      </div>

      {/* Export Card */}
      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 mr-2">
          <Download size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Xuất báo cáo tháng (.xlsx)</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Năm</label>
          <Input
            type="number"
            value={exportYear}
            onChange={(e) => setExportYear(Number(e.target.value))}
            className="w-24"
            min={2020}
            max={2099}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Tháng</label>
          <select
            value={exportMonth}
            onChange={(e) => setExportMonth(Number(e.target.value))}
            className="h-9 rounded-md border bg-background px-3 text-sm w-24"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>
        
        {/* Export Buttons */}
        {(!isManager || scopeType === "franchise") && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadStore}
            disabled={downloading === "store"}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Download size={14} className="mr-1.5" />
            {downloading === "store" ? "Đang tải..." : "Xuất báo cáo Cửa hàng"}
          </Button>
        )}
        {(isManager && scopeType === "kitchen") && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadKitchen}
            disabled={downloading === "kitchen"}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Download size={14} className="mr-1.5" />
            {downloading === "kitchen" ? "Đang tải..." : "Xuất báo cáo Bếp"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === id
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ══ TAB: INVENTORY ══ */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {invLoading ? (
            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
              Đang tải báo cáo tồn kho...
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng giá trị tồn kho</p>
                  <p className="text-xl font-bold text-primary">{fmtCurrency(totalClosingValue)}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng mặt hàng</p>
                  <p className="text-xl font-bold">{invItems.length}</p>
                  <p className="text-xs text-muted-foreground">{invIngredients.length} NL / {invProducts.length} BTP</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng hao hụt</p>
                  <p className={`text-xl font-bold ${totalWasted > 0 ? "text-destructive" : "text-green-600"}`}>
                    {fmt(totalWasted)}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Phạm vi</p>
                  <p className="text-sm font-semibold">
                    {invData?.data?.franchiseName ?? invData?.data?.centralKitchenName ?? "Bếp Trung Tâm"}
                  </p>
                  <p className="text-xs text-muted-foreground">{invData?.data?.scopeType}</p>
                </div>
              </div>

              {/* Notes */}
              {(invData?.data?.notes ?? []).length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 space-y-1">
                  {invData!.data.notes.map((n, i) => <p key={i}>⚠️ {n}</p>)}
                </div>
              )}

              {/* Table */}
              {invItems.length === 0 ? (
                <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                  Không có dữ liệu trong kỳ đã chọn.
                </div>
              ) : (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <BarChart3 size={18} /> Chi tiết Xuất - Nhập - Tồn
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3 text-left">Tên mặt hàng</th>
                          <th className="px-4 py-3 text-center">Loại</th>
                          <th className="px-4 py-3 text-center">ĐVT</th>
                          <th className="px-4 py-3 text-right">Tồn đầu</th>
                          <th className="px-4 py-3 text-right">Nhập</th>
                          <th className="px-4 py-3 text-right">Xuất</th>
                          <th className="px-4 py-3 text-right">Hủy</th>
                          <th className="px-4 py-3 text-right">Điều chỉnh</th>
                          <th className="px-4 py-3 text-right font-semibold text-foreground">Tồn cuối</th>
                          <th className="px-4 py-3 text-right font-semibold text-foreground">Giá trị tồn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invItems.map((item) => (
                          <tr key={item.itemId} className="hover:bg-muted/20">
                            <td className="px-4 py-3 font-medium">{item.itemName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.itemType === "INGREDIENT"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-purple-50 text-purple-700"
                              }`}>
                                {ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">{item.unit}</td>
                            <td className="px-4 py-3 text-right">{fmt(item.openingQuantity)}</td>
                            <td className="px-4 py-3 text-right text-green-700">+{fmt(item.inboundQuantity)}</td>
                            <td className="px-4 py-3 text-right text-orange-600">-{fmt(item.outboundQuantity)}</td>
                            <td className="px-4 py-3 text-right text-destructive">
                              {item.wastedQuantity > 0 ? `-${fmt(item.wastedQuantity)}` : "–"}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              {item.adjustmentQuantity !== 0
                                ? (item.adjustmentQuantity > 0 ? "+" : "") + fmt(item.adjustmentQuantity)
                                : "–"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold">
                              <span className={item.closingQuantity < 0 ? "text-destructive" : ""}>
                                {fmt(item.closingQuantity)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-primary">
                              {fmtCurrency(item.closingValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ TAB: WASTAGE ══ */}
      {activeTab === "wastage" && (
        <div className="space-y-6">
          {wastageLoading ? (
            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
              Đang tải báo cáo hao hụt...
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng thiệt hại</p>
                  <p className="text-xl font-bold text-destructive">
                    {fmtCurrency(wastageItems.reduce((s, i) => s + i.totalLostValue, 0))}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng SL hủy</p>
                  <p className="text-xl font-bold">
                    {fmt(wastageItems.reduce((s, i) => s + i.wastedQuantity, 0))}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Số loại nguyên liệu bị hủy</p>
                  <p className="text-xl font-bold">
                    {new Set(wastageItems.map((i) => i.ingredientId)).size}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {(wastageData?.data?.notes ?? []).length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 space-y-1">
                  {wastageData!.data.notes.map((n, i) => <p key={i}>⚠️ {n}</p>)}
                </div>
              )}

              {wastageItems.length === 0 ? (
                <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                  Không có hao hụt trong kỳ đã chọn.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar chart */}
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingDown size={16} className="text-destructive" />
                      Top nguyên liệu thiệt hại cao nhất
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={wastageChartData} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(val: number) => fmtCurrency(val)}
                        />
                        <Bar dataKey="Thiệt hại (đ)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie chart by reason */}
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Phân bổ thiệt hại theo lý do</h3>
                    {wasteReasonGroups.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={wasteReasonGroups}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {wasteReasonGroups.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: number) => fmtCurrency(val)} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-16">Không có dữ liệu</p>
                    )}
                  </div>
                </div>
              )}

              {/* Detail table */}
              {wastageItems.length > 0 && (
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="font-semibold">Chi tiết hao hụt</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-3 text-left">Nguyên liệu</th>
                          <th className="px-4 py-3 text-center">Lý do</th>
                          <th className="px-4 py-3 text-right">SL hủy</th>
                          <th className="px-4 py-3 text-right">Tỉ lệ hao hụt</th>
                          <th className="px-4 py-3 text-right">Thiệt hại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {wastageItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="px-4 py-3 font-medium">{item.ingredientName}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                {item.wasteReason}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {fmt(item.wastedQuantity)} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.wasteRate != null ? (
                                <span className={item.wasteRate > 10 ? "text-destructive font-medium" : ""}>
                                  {fmt(item.wasteRate)}%
                                </span>
                              ) : "–"}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-destructive">
                              {fmtCurrency(item.totalLostValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ TAB: STORE PERFORMANCE ══ */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {!isManager ? (
            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
              Tính năng này chỉ dành cho Manager / Admin.
            </div>
          ) : perfLoading ? (
            <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
              Đang tải báo cáo hiệu suất...
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng cửa hàng</p>
                  <p className="text-xl font-bold">{perfItems.length}</p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng doanh số nội bộ</p>
                  <p className="text-xl font-bold text-primary">
                    {fmtCurrency(perfItems.reduce((s, i) => s + i.totalSpending, 0))}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tổng đơn hàng</p>
                  <p className="text-xl font-bold">
                    {perfItems.reduce((s, i) => s + i.totalOrderCount, 0)}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Tỉ lệ đúng hạn TB</p>
                  <p className="text-xl font-bold text-green-600">
                    {perfItems.length > 0
                      ? fmt(
                          perfItems.reduce((s, i) => s + (i.onTimeRate ?? 0), 0) /
                            perfItems.length
                        ) + "%"
                      : "–"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {(perfData?.data?.notes ?? []).length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 space-y-1">
                  {perfData!.data.notes.map((n, i) => <p key={i}>⚠️ {n}</p>)}
                </div>
              )}

              {perfItems.length === 0 ? (
                <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                  Không có dữ liệu hiệu suất trong kỳ đã chọn.
                </div>
              ) : (
                <>
                  {/* Spending chart */}
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" />
                      Chi tiêu theo cửa hàng (sản phẩm + nguyên liệu)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={perfChartData} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(val: number) => fmtCurrency(val)} />
                        <Legend />
                        <Bar dataKey="Sản phẩm" fill="#6d28d9" stackId="a" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Nguyên liệu" fill="#16a34a" stackId="a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h3 className="font-semibold">Hiệu suất giao hàng theo cửa hàng</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="px-4 py-3 text-left">Cửa hàng</th>
                            <th className="px-4 py-3 text-right">Số đơn</th>
                            <th className="px-4 py-3 text-right">Chi SP</th>
                            <th className="px-4 py-3 text-right">Chi NL</th>
                            <th className="px-4 py-3 text-right font-semibold text-foreground">Tổng chi</th>
                            <th className="px-4 py-3 text-center">Đúng hạn</th>
                            <th className="px-4 py-3 text-center">Đánh giá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {[...perfItems]
                            .sort((a, b) => b.totalSpending - a.totalSpending)
                            .map((item) => {
                              const { label, cls } = onTimeLabel(item.onTimeRate);
                              return (
                                <tr key={item.franchiseId} className="hover:bg-muted/20">
                                  <td className="px-4 py-3 font-medium">{item.franchiseName}</td>
                                  <td className="px-4 py-3 text-right">{item.totalOrderCount}</td>
                                  <td className="px-4 py-3 text-right text-purple-700">
                                    {fmtCurrency(item.totalProductSpending)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-green-700">
                                    {fmtCurrency(item.totalIngredientSpending)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-primary">
                                    {fmtCurrency(item.totalSpending)}
                                  </td>
                                  <td className="px-4 py-3 text-center text-muted-foreground">
                                    {item.onTimeDeliveredOrders}/{item.totalDeliveredOrders}
                                    {item.onTimeRate != null && (
                                      <span className="ml-1 text-xs">({fmt(item.onTimeRate)}%)</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`font-semibold text-xs ${cls}`}>{label}</span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
