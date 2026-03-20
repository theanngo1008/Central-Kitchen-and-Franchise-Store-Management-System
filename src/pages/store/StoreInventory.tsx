import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, ChevronDown, ChevronRight, Package, Box, RefreshCw } from 'lucide-react';
import { useStoreInventorySummary } from '@/hooks/store/useInventory';
import { authApi } from '@/api';

const StoreInventory: React.FC = () => {
  const user = authApi.getCurrentUser();
  const franchiseId = user?.franchiseId ? Number(user.franchiseId) : undefined;

  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: summaryResponse, isLoading, isError, refetch } = useStoreInventorySummary(franchiseId!);

  // The wrapper guarantees the normalized payload. We get `items` if it exists.
  const inventoryItems = summaryResponse?.items || [];

  const filteredItems = inventoryItems.filter(item =>
    item.itemName.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventoryItems.filter(i => i.isLowStock).length;

  const toggleRow = (itemKey: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(itemKey)) {
      newExpandedRows.delete(itemKey);
    } else {
      newExpandedRows.add(itemKey);
    }
    setExpandedRows(newExpandedRows);
  };

  if (!franchiseId) {
    return <div className="p-8 text-center">Không tìm thấy mã Cửa hàng.</div>;
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin tồn kho...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">Không thể tải dữ liệu tồn kho.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader 
        title="Tồn Kho Cửa Hàng" 
        subtitle={`Quản lý toàn bộ hàng hóa và nguyên liệu của cửa hàng`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Box size={14}/>Tổng phân loại mặt hàng</p>
          <p className="text-2xl font-semibold mt-1">{inventoryItems.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Package size={14}/>Thành phẩm</p>
          <p className="text-2xl font-semibold mt-1">
            {inventoryItems.filter(i => i.itemType === 'PRODUCT').length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-1">Nguyên liệu</p>
          <p className="text-2xl font-semibold mt-1">
            {inventoryItems.filter(i => i.itemType === 'INGREDIENT').length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-sm bg-destructive/5 border-destructive/20">
          <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle size={14}/>Cảnh báo sắp hết</p>
          <p className="text-2xl font-semibold text-destructive mt-1">{lowStockCount}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm mặt hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 w-10"></th>
                <th className="p-3 text-left font-medium">Tên mặt hàng</th>
                <th className="p-3 text-left font-medium">Phân loại</th>
                <th className="p-3 text-right font-medium">Tổng tồn kho</th>
                <th className="p-3 text-right font-medium">Mức tối thiểu</th>
                <th className="p-3 text-center font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Không tìm thấy dữ liệu tồn kho.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const itemKey = `${item.itemType}-${item.itemId}`;
                  const isExpanded = expandedRows.has(itemKey);

                  return (
                    <React.Fragment key={itemKey}>
                      <tr className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${item.isLowStock ? 'bg-destructive/5' : ''}`}>
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleRow(itemKey)}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Button>
                        </td>
                        <td className="p-3 font-medium">
                          {item.itemName}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.itemType === 'PRODUCT' ? 'Thành phẩm' : 'Nguyên liệu'}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {item.totalQuantity} <span className="font-normal text-muted-foreground">{item.unit}</span>
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {item.lowStockThreshold || '—'}
                        </td>
                        <td className="p-3 text-center">
                          {item.isLowStock ? (
                            <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                              <AlertTriangle size={12} /> Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center bg-green-500/10 text-green-600 border border-green-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                              Đủ hàng
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Batches expanded row */}
                      {isExpanded && (
                        <tr className="bg-muted/10 border-b">
                          <td colSpan={6} className="p-0">
                            <div className="pl-14 pr-4 py-4">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Lô hàng chi tiết ({item.batches.length})
                              </h4>
                              {item.batches.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Không có lô hàng khả dụng.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                  {item.batches.map(batch => {
                                    const isExpired = batch.expiredAt && new Date(batch.expiredAt) < new Date();
                                    return (
                                      <div key={batch.batchId} className={`border rounded-lg p-3 ${isExpired ? 'border-destructive/50 bg-destructive/5' : 'bg-background'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-medium text-sm truncate pr-2" title={batch.batchCode}>{batch.batchCode}</span>
                                          <span className="text-sm font-semibold whitespace-nowrap">{batch.quantity}</span>
                                        </div>
                                        {batch.expiredAt && (
                                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <span>HSD: {batch.expiredAt}</span>
                                            {isExpired && <span className="ml-2 text-destructive font-medium">(Hết hạn)</span>}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreInventory;