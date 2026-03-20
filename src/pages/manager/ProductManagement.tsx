import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useCreateProduct, useUpdateProduct, useToggleProductStatus } from '@/hooks/products';
import { getBoms } from '@/api/manager/bomApi';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/product';
import { 
  Plus, 
  Search, 
  Coffee, 
  Edit, 
  Eye,
  Package,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { StatusBadge, ProductTypeBadge, Pagination, SortableHeader, getProductTypeLabel } from '@/components/common';

type SortField = 'name' | 'sku' | 'unit' | 'status' | 'productType';
type SortOrder = 'asc' | 'desc';

const ExpandableProductRow = ({ 
  product, 
  onView, 
  onEdit, 
  onToggleStatus, 
  isPendingStatus 
}: { 
  product: Product; 
  onView: (p: Product) => void; 
  onEdit: (p: Product) => void; 
  onToggleStatus: (p: Product) => void; 
  isPendingStatus: boolean; 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: bomDataResponse, isLoading: isLoadingBom } = useQuery({
    queryKey: ['boms', product.id, 'ACTIVE'],
    queryFn: () => getBoms({ productId: product.id, status: 'ACTIVE' }),
    enabled: isExpanded && product.productType === 'FINISHED',
  });
  
  const activeBom = useMemo(() => {
    return bomDataResponse?.data?.items?.[0] || null;
  }, [bomDataResponse]);

  const canExpand = product.productType === 'FINISHED';

  return (
    <>
      <TableRow className={`group ${product.status === 'INACTIVE' ? 'opacity-60' : ''}`}>
        <TableCell>
          <div className="flex items-center gap-3">
            {canExpand && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </Button>
            )}
            {!canExpand && <div className="w-6" />}
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <p className="font-medium">{product.name}</p>
          </div>
        </TableCell>
        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
        <TableCell>{product.unit}</TableCell>
        <TableCell>
          <ProductTypeBadge type={product.productType} />
        </TableCell>
        <TableCell>
          <StatusBadge status={product.status} activeLabel="Đang bán" inactiveLabel="Ngừng bán" />
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => onView(product)} title="Xem chi tiết">
              <Eye size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} title="Chỉnh sửa">
              <Edit size={16} />
            </Button>
            <Switch
              checked={product.status === 'ACTIVE'}
              onCheckedChange={() => onToggleStatus(product)}
              disabled={isPendingStatus}
              className="ml-2"
              title={product.status === 'ACTIVE' ? 'Ngừng bán' : 'Mở bán'}
            />
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Row */}
      {isExpanded && canExpand && (
        <TableRow className="bg-muted/10 hover:bg-muted/10">
          <TableCell colSpan={6} className="p-0 border-b">
            <div className="p-4 pl-12">
              <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 bg-muted/30 border-b flex justify-between items-center">
                  <span className="font-medium text-primary text-sm">Định mức nguyên liệu (BOM)</span>
                </div>
                {isLoadingBom ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : activeBom && activeBom.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground">Nguyên liệu</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground">Định mức</th>
                        <th className="text-right py-2 px-4 font-medium text-muted-foreground border-r">Đơn vị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBom.items.map((ing, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2 px-4">{ing.ingredientName || '---'}</td>
                          <td className="py-2 px-4 text-right">{ing.quantity}</td>
                          <td className="py-2 px-4 text-right text-muted-foreground border-r">{ing.ingredientUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground italic">
                    Chưa có nguyên liệu. (Để thiết lập, vui lòng sang trang Công thức & BOM)
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const ProductManagement: React.FC = () => {
  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Dialog states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: '',
    productType: 'FINISHED',
    shelfLifeDays: 1,
  });

  // React Query hooks
  const { data: productsResponse, isLoading, isError, refetch } = useProducts({
    status: statusFilter === 'all' ? 'ALL' : statusFilter as 'ACTIVE' | 'INACTIVE',
    productType: typeFilter !== 'all' ? typeFilter as 'FINISHED' | 'SEMI_FINISHED' : undefined,
    q: searchTerm || undefined,
    page: currentPage,
    pageSize,
    sortBy: sortField,
    sortDir: sortOrder,
  });

  const products: Product[] = useMemo(() => {
    if (!productsResponse) return [];
    return productsResponse.data?.items || [];
  }, [productsResponse]);

  const totalItems = productsResponse?.data?.totalItems || 0;
  const totalPages = productsResponse?.data?.totalPages || 1;

  // Fetch BOM for View Mode
  const { data: bomDataResponse, isLoading: isLoadingBom } = useQuery({
    queryKey: ['boms', selectedProduct?.id, 'ACTIVE'],
    queryFn: () => getBoms({ productId: selectedProduct!.id, status: 'ACTIVE' }),
    enabled: isViewMode && !!selectedProduct && selectedProduct.productType === 'FINISHED',
  });
  
  const activeBom = useMemo(() => {
    return bomDataResponse?.data?.items?.[0] || null;
  }, [bomDataResponse]);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const toggleStatusMutation = useToggleProductStatus();

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

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      productType: product.productType,
      shelfLifeDays: product.shelfLifeDays ?? 1,
    });
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      productType: product.productType,
      shelfLifeDays: product.shelfLifeDays ?? 1,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      sku: '',
      unit: '',
      productType: 'FINISHED',
      shelfLifeDays: 1,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (product: Product) => {
    toggleStatusMutation.mutate({ 
      id: product.id, 
      status: product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.sku || !formData.unit || !formData.shelfLifeDays) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (formData.shelfLifeDays < 1) {
      toast.error('Hạn sử dụng phải lớn hơn 0 ngày');
      return;
    }

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: formData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedProduct(null);
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
        }
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader 
          title="Quản lý Menu Trà Sữa" 
          subtitle="Quản lý danh sách sản phẩm"
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
          title="Quản lý Menu Trà Sữa" 
          subtitle="Quản lý danh sách sản phẩm"
        />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Không thể tải dữ liệu sản phẩm</p>
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
        title="Quản lý Menu Trà Sữa" 
        subtitle="Quản lý danh sách sản phẩm"
        action={{
          label: 'Thêm sản phẩm',
          icon: Plus,
          onClick: handleAdd
        }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Tìm kiếm theo tên hoặc SKU..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Đang bán</SelectItem>
            <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Loại sản phẩm" />
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <SortableHeader label="Tên sản phẩm" field="name" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                <SortableHeader label="SKU" field="sku" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('unit')}>
                <SortableHeader label="Đơn vị" field="unit" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('productType')}>
                <SortableHeader label="Loại" field="productType" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <SortableHeader label="Trạng thái" field="status" currentField={sortField} currentOrder={sortOrder} onSort={handleSort} />
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <Coffee size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Không tìm thấy sản phẩm nào</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ExpandableProductRow 
                  key={product.id} 
                  product={product} 
                  onView={handleView} 
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  isPendingStatus={toggleStatusMutation.isPending}
                />
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

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Chi tiết sản phẩm' : selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tên sản phẩm <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isViewMode}
                placeholder="VD: Trà sữa trân châu đường đen"
              />
            </div>
            <div>
              <Label>SKU <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                disabled={isViewMode}
                placeholder="VD: TS-001"
              />
            </div>
            <div>
              <Label>Đơn vị tính <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                disabled={isViewMode}
                placeholder="VD: ly, cốc"
              />
            </div>
            <div>
              <Label>Loại sản phẩm <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.productType} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, productType: val }))}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINISHED">Thành phẩm</SelectItem>
                  <SelectItem value="SEMI_FINISHED">Bán thành phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hạn sử dụng (ngày) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min={1}
                value={formData.shelfLifeDays}
                onChange={(e) => setFormData(prev => ({ ...prev, shelfLifeDays: Number(e.target.value) }))}
                disabled={isViewMode}
                placeholder="VD: 7"
              />
            </div>

            {selectedProduct && isViewMode && (
              <div className="pt-2 border-t space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className={selectedProduct.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>
                    {selectedProduct.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </div>
                
                {selectedProduct.productType === 'FINISHED' && (
                  <div className="pt-2 border-t space-y-2">
                    <Label className="font-semibold text-primary">Định mức nguyên liệu (BOM)</Label>
                    {isLoadingBom ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : activeBom && activeBom.items.length > 0 ? (
                      <div className="bg-muted/30 rounded-lg overflow-hidden text-sm border">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Nguyên liệu</th>
                              <th className="text-right py-2 px-3 font-medium text-muted-foreground">Định mức</th>
                              <th className="text-right py-2 px-3 font-medium text-muted-foreground">Đơn vị</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBom.items.map((ing, idx) => (
                              <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="py-2 px-3 font-medium">{ing.ingredientName || '---'}</td>
                                <td className="py-2 px-3 text-right">{ing.quantity}</td>
                                <td className="py-2 px-3 text-right text-muted-foreground">{ing.ingredientUnit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm border text-muted-foreground bg-muted/30 p-3 rounded-md text-center italic">
                        Chưa có nguyên liệu. (Để thiết lập, vui lòng sang trang Công thức & BOM)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isViewMode && (
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Hủy
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {selectedProduct ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
