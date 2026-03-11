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
  RefreshCw
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
import { CatalogViewDialog, EditPriceDialog, AddProductDialog } from '@/components/store-catalog';
import { formatDateTime, formatCurrency } from '@/utils/formatters';

type SortField = 'productName' | 'sku' | 'price' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';


const StoreCatalogManagement: React.FC = () => {
  // Franchise selection
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(0);

  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
  const { data: franchisesData } = useQuery({
    queryKey: ['admin-franchises'],
    queryFn: () => adminFranchisesApi.list(),
  });

  const activeFranchises = useMemo(() => {
    if (!franchisesData) return [];
    return franchisesData.filter(f => f.status === 'ACTIVE' && f.type === 'STORE');
  }, [franchisesData]);

  const { data: catalogResponse, isLoading, isError, refetch } = useStoreCatalog({
    franchiseId: selectedFranchiseId,
    status: statusFilter === 'all' ? 'ALL' : statusFilter as 'ACTIVE' | 'INACTIVE',
    productType: typeFilter !== 'all' ? typeFilter as 'FINISHED' | 'SEMI_FINISHED' : undefined,
    q: searchTerm || undefined,
    page: currentPage,
    pageSize,
    sortBy: sortField,
    sortDir: sortOrder,
  });

  // Products for adding to catalog
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({
    status: 'ACTIVE',
    q: productSearchTerm || undefined,
    pageSize: 50,
  });

  const assignMutation = useAssignProduct();
  const updatePriceMutation = useUpdateCatalogPrice();
  const updateStatusMutation = useUpdateCatalogStatus();

  // Get catalog items array from API response
  const catalogItems: StoreCatalog[] = useMemo(() => {
    if (!catalogResponse) return [];
    return catalogResponse.data?.items || [];
  }, [catalogResponse]);

  const totalItems = catalogResponse?.data?.totalItems || 0;
  const totalPages = catalogResponse?.data?.totalPages || 1;

  // Products available for adding
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
      franchiseId: selectedFranchiseId,
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

  // No franchise selected state
  if (!selectedFranchiseId) {
    return (
      <div className="animate-fade-in">
        <PageHeader 
          title="Danh mục cửa hàng" 
          subtitle="Quản lý sản phẩm và giá theo từng chi nhánh"
        />

        <div className="bg-card border rounded-xl p-8 text-center">
          <Store size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-lg font-semibold mb-2">Chọn chi nhánh</h3>
          <p className="text-muted-foreground mb-6">Vui lòng chọn chi nhánh để xem và quản lý danh mục sản phẩm</p>
          
          <Select onValueChange={(val) => setSelectedFranchiseId(Number(val))}>
            <SelectTrigger className="w-[300px] mx-auto">
              <SelectValue placeholder="Chọn chi nhánh..." />
            </SelectTrigger>
            <SelectContent>
              {activeFranchises.map(franchise => (
                <SelectItem key={franchise.franchiseId} value={franchise.franchiseId.toString()}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  const selectedFranchise = activeFranchises.find(f => f.franchiseId === selectedFranchiseId);

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader 
          title={`Danh mục: ${selectedFranchise?.name}`}
          subtitle="Quản lý sản phẩm và giá theo chi nhánh"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader 
          title={`Danh mục: ${selectedFranchise?.name}`}
          subtitle="Quản lý sản phẩm và giá theo chi nhánh"
        />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Không thể tải dữ liệu danh mục</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Danh mục: ${selectedFranchise?.name}`}
        subtitle="Quản lý sản phẩm và giá theo chi nhánh"
        action={{
          label: 'Thêm sản phẩm',
          icon: Plus,
          onClick: handleOpenAddProduct
        }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedFranchiseId.toString()} onValueChange={(val) => { setSelectedFranchiseId(Number(val)); setCurrentPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Chọn chi nhánh" />
          </SelectTrigger>
          <SelectContent>
            {activeFranchises.map(franchise => (
              <SelectItem key={franchise.franchiseId} value={franchise.franchiseId.toString()}>
                {franchise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          <span className="text-sm text-muted-foreground">
            Tổng: <span className="font-semibold text-foreground">{totalItems}</span> sản phẩm
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
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
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <Store size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Chưa có sản phẩm nào trong danh mục</p>
                  <Button variant="link" onClick={handleOpenAddProduct} className="mt-2">
                    <Plus size={16} className="mr-1" />
                    Thêm sản phẩm
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              catalogItems.map((item) => (
                <TableRow key={`${item.franchiseId}-${item.productId}`} className={item.status === 'INACTIVE' ? 'opacity-60' : ''}>
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

export default StoreCatalogManagement;
