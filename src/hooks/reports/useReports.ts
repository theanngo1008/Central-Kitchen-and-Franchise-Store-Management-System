// src/hooks/reports/useReports.ts
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/manager/reportsApi";
import type {
  InventoryReportQuery,
  WastageReportQuery,
  StorePerformanceReportQuery,
} from "@/types/reports";

export const useInventoryReport = (params: InventoryReportQuery, enabled = true) =>
  useQuery({
    queryKey: ["report-inventory", params],
    queryFn: () => reportsApi.getInventory(params),
    enabled,
  });

export const useWastageReport = (params: WastageReportQuery, enabled = true) =>
  useQuery({
    queryKey: ["report-wastage", params],
    queryFn: () => reportsApi.getWastage(params),
    enabled,
  });

export const useStorePerformanceReport = (params: StorePerformanceReportQuery, enabled = true) =>
  useQuery({
    queryKey: ["report-store-performance", params],
    queryFn: () => reportsApi.getStorePerformance(params),
    enabled,
  });
