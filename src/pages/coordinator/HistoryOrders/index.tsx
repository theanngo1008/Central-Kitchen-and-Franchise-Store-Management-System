import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  RefreshCw,
  SearchIcon,
  CalendarDays,
  History,
} from "lucide-react";
import { useSupplyHistory } from "@/hooks/coordinator/useSupplyHistory";
import HistoryOrderTable from "./components/HistoryOrderTable";
import HistoryOrderDetailModal from "./components/HistoryOrderDetailModal";

const HistoryOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useSupplyHistory({
    page: currentPage,
    pageSize,
    search: searchTerm || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    status: status === "ALL" ? undefined : status,
    sortDir: "desc",
  });

  const orders = response?.items || [];
  const totalPages = response?.totalPages || 1;

  const handleOrderClick = (orderId: number, storeId: number, storeName: string) => {
    setSelectedOrderId(orderId);
    setSelectedStoreId(storeId);
    setSelectedStoreName(storeName);
    setIsModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setStatus("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <PageHeader
        title="Lịch sử đơn hàng"
        subtitle="Tra cứu và xem lại các đơn hàng đã xử lý xong trong quá khứ."
      />

      <div className="bg-card rounded-xl border p-4 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm tên cửa hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Từ ngày
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" /> Đến ngày
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="DELIVERED">Đã giao hàng</option>
                  <option value="RECEIVED_BY_STORE">Cửa hàng đã nhận</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <Button type="submit" className="gap-2">
                <SearchIcon size={16} /> Tìm kiếm
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
          <p className="mb-4 font-medium">Không thể tải dữ liệu lịch sử.</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Thử lại
          </Button>
        </div>
      ) : (
        <>
          <HistoryOrderTable orders={orders} onOrderClick={handleOrderClick} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1 font-medium bg-muted px-4 py-2 rounded-lg text-sm">
                Trang <span className="text-primary">{currentPage}</span> /{" "}
                {totalPages}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      {/* History Detail Modal */}
      <HistoryOrderDetailModal
        orderId={selectedOrderId}
        storeId={selectedStoreId}
        storeName={selectedStoreName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HistoryOrders;
