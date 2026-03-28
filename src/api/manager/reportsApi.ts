// src/api/manager/reportsApi.ts
import adminApi from "@/api/api";
import type { ApiResponse } from "@/types/common/apiResponse.types";
import type {
  InventoryReportQuery,
  InventoryReportResponse,
  WastageReportQuery,
  WastageReportResponse,
  StorePerformanceReportQuery,
  StorePerformanceReportResponse,
  StoreMonthlyExportQuery,
  KitchenMonthlyExportQuery,
} from "@/types/reports";

const BASE = "/reports";

export const reportsApi = {
  getInventory: async (params: InventoryReportQuery) =>
    (
      await adminApi.get<ApiResponse<InventoryReportResponse>>(
        `${BASE}/inventory`,
        { params }
      )
    ).data,

  getWastage: async (params: WastageReportQuery) =>
    (
      await adminApi.get<ApiResponse<WastageReportResponse>>(
        `${BASE}/wastage`,
        { params }
      )
    ).data,

  getStorePerformance: async (params: StorePerformanceReportQuery) =>
    (
      await adminApi.get<ApiResponse<StorePerformanceReportResponse>>(
        `${BASE}/store-performance`,
        { params }
      )
    ).data,

  /** Download store monthly XLSX via authenticated request */
  downloadStoreMonthly: async (params: StoreMonthlyExportQuery) => {
    const p = new URLSearchParams();
    p.set("year", String(params.year));
    p.set("month", String(params.month));
    if (params.franchiseId != null) p.set("franchiseId", String(params.franchiseId));
    p.set("timezoneOffsetMinutes", String(params.timezoneOffsetMinutes ?? 420));
    const res = await adminApi.get(`/reports/export/store-monthly?${p}`, {
      responseType: "blob",
    });
    triggerDownload(res.data, res.headers["content-disposition"], `store-monthly-${params.year}-${params.month}.xlsx`);
  },

  /** Download kitchen monthly XLSX via authenticated request */
  downloadKitchenMonthly: async (params: KitchenMonthlyExportQuery) => {
    const p = new URLSearchParams();
    p.set("year", String(params.year));
    p.set("month", String(params.month));
    if (params.centralKitchenId != null) p.set("centralKitchenId", String(params.centralKitchenId));
    p.set("timezoneOffsetMinutes", String(params.timezoneOffsetMinutes ?? 420));
    const res = await adminApi.get(`/reports/export/kitchen-monthly?${p}`, {
      responseType: "blob",
    });
    triggerDownload(res.data, res.headers["content-disposition"], `kitchen-monthly-${params.year}-${params.month}.xlsx`);
  },
};

function triggerDownload(blob: Blob, contentDisposition: string | undefined, fallbackName: string) {
  // Try to parse filename from Content-Disposition header
  let filename = fallbackName;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/);
    if (match) filename = match[2];
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

