import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStoreCatalog, useAssignProduct, useUpdateCatalogPrice, useUpdateCatalogStatus } from "@/hooks/storeCatalog/useStoreCatalog";
import { useProducts } from '@/hooks/products';
import { useQuery } from '@tanstack/react-query';
import { adminFranchisesApi } from '@/api/admin/franchises.api';
import type { StoreCatalog } from '@/types/storeCatalog';
import type { Product } from '@/types/product';
import { 
  Plus, 
  Search, 
  Store,
  Edit, 
  Eye,
  Package,
  Loader2,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Shared components
import { StatusBadge, ProductTypeBadge, Pagination, SortableHeader } from '@/components/common';
import { CatalogViewDialog, EditPriceDialog, AddProductDialog, ProductIngredients } from '@/components/store-catalog';
import { formatDateTime, formatCurrency } from '@/utils/formatters';

type SortField = 'productName' | 'sku' | 'price' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

// ─── Store List View ────────────────────────────────────────────────────────

interface StoreListViewProps {
  onSelectStore: (franchiseId: number) => void;
}

const StoreListView: React.FC<StoreListViewProps> = ({ onSelectStore }) => {
  const [storeSearch, setStoreSearch] = useState('');

  const { data: franchisesData, isLoading } = useQuery({
    queryKey: ['admin-franchises'],
    queryFn: () => adminFranchisesApi.list(),
  });

  const activeFranchises = useMemo(() => {
    if (!franchisesData) return [];
    return franchisesData.filter(f => f.status === 'ACTIVE' && f.type === 'STORE');
  }, [franchisesData]);

  const filteredFranchises = useMemo(() => {
    if (!storeSearch.trim()) return activeFranchises;
    return activeFranchises.filter(f =>
      f.name.toLowerCase().includes(storeSearch.toLowerCase())
    );
  }, [activeFranchises, storeSearch]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Danh mục cửa hàng"
        subtitle="Chọn cửa hàng để quản lý danh mục sản phẩm và giá"
      />

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Tìm kiếm cửa hàng..."
          value={storeSearch}
          onChange={(e) => setStoreSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải danh sách cửa hàng...</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredFranchises.length === 0 && (
        <div className="bg-card border rounded-xl p-16 text-center">
          <Store size={56} className="mx-auto mb-4 text-muted-foreground opacity-25" />
          <h3 className="text-lg font-semibold mb-1">Không tìm thấy cửa hàng</h3>
          <p className="text-sm text-muted-foreground">
            {storeSearch ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có cửa hàng nào được kích hoạt'}
          </p>
        </div>
      )}

      {/* Store grid */}
      {!isLoading && filteredFranchises.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredFranchises.length} cửa hàng
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFranchises.map((franchise) => (
              <button
                key={franchise.franchiseId}
                onClick={() => onSelectStore(franchise.franchiseId)}
                className="group bg-card border rounded-xl p-5 text-left hover:border-primary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {/* Icon area */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Store size={24} className="text-primary" />
                </div>

                {/* Name */}
                <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {franchise.name}
                </h3>

                {/* Address / ID */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <MapPin size={12} />
                  <span className="truncate">{franchise.address || `ID: ${franchise.franchiseId}`}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Đang hoạt động
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Store Catalog Detail View ───────────────────────────────────────────────

interface StoreCatalogDetailProps {
  franchiseId: number;
  franchiseName: string;
  onBack: () => void;
}

const StoreCatalogDetail: React.FC<StoreCatalogDetailProps> = ({
  franchiseId,
  franchiseName,
  onBack,
}) => {
  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Expandable row state
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Dialog states
  const [selectedItem, setSelectedItem] = useState<StoreCatalog | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditPriceDialogOpen, setIsEditPriceDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Add product dialog states  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignPrice, setAssignPrice] = useState<number>(0);

  // React Query hooks
  const { data: catalogResponse, isLoading, isError, refetch } = useStoreCatalog({
    franchiseId,
    status: statusFilter === 'all' ? 'ALL' : statusFilter as 'ACTIVE' | 'INACTIVE',
    productType: typeFilter !== 'all' ? typeFilter as 'FINISHED' | 'SEMI_FINISHED' : undefined,
    q: searchTerm || undefined,
    page: currentPage,
    pageSize,
    sortBy: sortField,
    sortDir: sortOrder,
  });

  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({
    status: 'ACTIVE',
    q: productSearchTerm || undefined,
    pageSize: 50,
  });

  const assignMutation = useAssignProduct();
  const updatePriceMutation = useUpdateCatalogPrice();
  const updateStatusMutation = useUpdateCatalogStatus();

  const catalogItems: StoreCatalog[] = useMemo(() => {
    if (!catalogResponse) return [];
    return catalogResponse.data?.items || [];
  }, [catalogResponse]);

  const totalItems = catalogResponse?.data?.totalItems || 0;
  const totalPages = catalogResponse?.data?.totalPages || 1;

  const availableProducts: Product[] = useMemo(() => {
    if (!productsResponse) return [];
    const products = productsResponse.data?.items || [];
    const catalogProductIds = new Set(catalogItems.map(item => item.productId));
    return products.filter(p => !catalogProductIds.has(p.id));
  }, [productsResponse, catalogItems]);

  // Handlers
  const handleSort = (field: string) => {
    const typedField = field as SortField;
    if (sortField === typedField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(typedField);
      setSortOrder('asc');
    }
  };

  const handleView = (item: StoreCatalog) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditPrice = (item: StoreCatalog) => {
    setSelectedItem(item);
    setNewPrice(item.price);
    setIsEditPriceDialogOpen(true);
  };

  const handleSavePrice = () => {
    if (!selectedItem) return;
    if (newPrice < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    updatePriceMutation.mutate({
      franchiseId: selectedItem.franchiseId,
      productId: selectedItem.productId,
      data: { price: newPrice }
    }, {
      onSuccess: () => {
        setIsEditPriceDialogOpen(false);
        setSelectedItem(null);
      }
    });
  };

  const handleToggleStatus = (item: StoreCatalog) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateStatusMutation.mutate({
      franchiseId: item.franchiseId,
      productId: item.productId,
      data: { status: newStatus }
    });
  };

  const handleToggleRow = (productId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(productId)) {
      newExpandedRows.delete(productId);
    } else {
      newExpandedRows.add(productId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleOpenAddProduct = () => {
    setProductSearchTerm('');
    setSelectedProduct(null);
    setAssignPrice(0);
    setIsAddProductDialogOpen(true);
  };

  const handleAssignProduct = () => {
    if (!selectedProduct) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (assignPrice < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    assignMutation.mutate({
      franchiseId,
      productId: selectedProduct.id,
      price: assignPrice,
    }, {
      onSuccess: () => {
        setIsAddProductDialogOpen(false);
        setSelectedProduct(null);
        setAssignPrice(0);
      }
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Danh mục cửa hàng
        </button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{franchiseName}</span>
      </div>

      <PageHeader
        title={franchiseName}
        subtitle="Quản lý danh mục sản phẩm và giá bán"
        action={{
          label: 'Thêm sản phẩm',
          icon: Plus,
          onClick: handleOpenAddProduct
        }}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Không thể tải dữ liệu danh mục</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !isError && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="ACTIVE">Đang bán</SelectItem>
                <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="FINISHED">Thành phẩm</SelectItem>
                <SelectItem value="SEMI_FINISHED">Bán thành phẩm</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="icon" onClick={() => refetch()} title="Làm mới">
                <RefreshCw size={18} />
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShoppingBag size={14} />
                <span>Tổng: <span className="font-semibold text-foreground">{totalItems}</span> sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('productName')}>
                    <SortableHeader label="Sản phẩm" field="productName" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                    <SortableHeader label="SKU" field="sku" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => handleSort('price')}>
                    <SortableHeader label="Giá bán" field="price" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} className="justify-end" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <SortableHeader label="Trạng thái" field="status" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                    <SortableHeader label="Cập nhật" field="updatedAt" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      <Package size={40} className="mx-auto mb-2 opacity-30" />
                      <p>Chưa có sản phẩm nào trong danh mục</p>
                      <Button variant="link" onClick={handleOpenAddProduct} className="mt-2">
                        <Plus size={16} className="mr-1" />
                        Thêm sản phẩm
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  catalogItems.map((item) => (
                    <React.Fragment key={`${item.franchiseId}-${item.productId}`}>
                      <TableRow className={item.status === 'INACTIVE' ? 'opacity-60' : ''}>
                        <TableCell>
                          {item.productType === 'FINISHED' ? (
                            <Button variant="ghost" size="icon" onClick={() => handleToggleRow(item.productId)} className="h-6 w-6">
                              <ChevronRight size={14} className={`transition-transform duration-200 ${expandedRows.has(item.productId) ? 'rotate-90' : ''}`} />
                            </Button>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package size={18} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.unit}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>
                          <ProductTypeBadge type={item.productType} />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} activeLabel="Đang bán" inactiveLabel="Ngừng bán" />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTime(item.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleView(item)} title="Xem chi tiết">
                              <Eye size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditPrice(item)} title="Sửa giá">
                              <Edit size={16} />
                            </Button>
                            <Switch
                              checked={item.status === 'ACTIVE'}
                              onCheckedChange={() => handleToggleStatus(item)}
                              disabled={updateStatusMutation.isPending}
                              className="ml-2"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(item.productId) && item.productType === 'FINISHED' && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0 border-b">
                            <ProductIngredients productId={item.productId} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </>
      )}

      {/* Dialogs */}
      <CatalogViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        item={selectedItem}
      />

      <EditPriceDialog
        open={isEditPriceDialogOpen}
        onOpenChange={setIsEditPriceDialogOpen}
        item={selectedItem}
        price={newPrice}
        onPriceChange={setNewPrice}
        onSave={handleSavePrice}
        isPending={updatePriceMutation.isPending}
      />

      <AddProductDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        searchTerm={productSearchTerm}
        onSearchChange={setProductSearchTerm}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        price={assignPrice}
        onPriceChange={setAssignPrice}
        onAssign={handleAssignProduct}
        isPending={assignMutation.isPending}
        isLoadingProducts={isLoadingProducts}
        availableProducts={availableProducts}
      />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const StoreCatalogManagement: React.FC = () => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null);
  const [selectedFranchiseName, setSelectedFranchiseName] = useState<string>('');

  const { data: franchisesData } = useQuery({
    queryKey: ['admin-franchises'],
    queryFn: () => adminFranchisesApi.list(),
  });

  const activeFranchises = useMemo(() => {
    if (!franchisesData) return [];
    return franchisesData.filter(f => f.status === 'ACTIVE' && f.type === 'STORE');
  }, [franchisesData]);

  const handleSelectStore = (franchiseId: number) => {
    const franchise = activeFranchises.find(f => f.franchiseId === franchiseId);
    setSelectedFranchiseId(franchiseId);
    setSelectedFranchiseName(franchise?.name ?? '');
  };

  const handleBack = () => {
    setSelectedFranchiseId(null);
    setSelectedFranchiseName('');
  };

  if (selectedFranchiseId !== null) {
    return (
      <StoreCatalogDetail
        franchiseId={selectedFranchiseId}
        franchiseName={selectedFranchiseName}
        onBack={handleBack}
      />
    );
  }

  return <StoreListView onSelectStore={handleSelectStore} />;
};

export default StoreCatalogManagement;
