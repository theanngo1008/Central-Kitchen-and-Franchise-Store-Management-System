import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  useIngredients, 
  useCreateIngredient, 
  useUpdateIngredient, 
  useToggleIngredientStatus 
} from '@/hooks/ingredients';
import { useSuppliers } from '@/hooks/suppliers/useSuppliers';
import type { Ingredient, IngredientFormData } from '@/types/ingredient';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Loader2,
  RefreshCw
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

type SortField = 'name' | 'unit' | 'safetyStock' | 'wasteThreshold' | 'status' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

// Format ISO date to readable Vietnamese format
const formatDateTime = (isoString: string): string => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

const IngredientManagement: React.FC = () => {
  // Filter & Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    unit: '',
    supplierId: null,
    shelfLifeDays: 1,
    price: 0,
    safetyStock: 0,
    wasteThreshold: 0,
  });

  // React Query hooks
  const { data: ingredientsResponse, isLoading, isError, refetch } = useIngredients({ pageSize: 1000 });
  const { data: suppliersResponse } = useSuppliers({ pageSize: 1000 });
  const suppliers = suppliersResponse?.data?.items || [];

  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const toggleStatusMutation = useToggleIngredientStatus();

  // Get ingredients array from API response
  // API returns: { success: true, data: { items: [...], page, pageSize, totalItems, totalPages } }
  const ingredients: Ingredient[] = useMemo(() => {
    if (!ingredientsResponse) return [];
    // Extract items from paginated response
    return ingredientsResponse.data?.items || [];
  }, [ingredientsResponse]);

  // Filter, sort, and paginate
  const processedIngredients = useMemo(() => {
    let result = [...ingredients];

    // Filter by search
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ingredients, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedIngredients.length / pageSize);
  const paginatedIngredients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedIngredients.slice(start, start + pageSize);
  }, [processedIngredients, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="ml-1" /> 
      : <ArrowDown size={14} className="ml-1" />;
  };

  const handleView = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      supplierId: (ingredient as any).supplierId ?? null,
      shelfLifeDays: (ingredient as any).shelfLifeDays ?? 1,
      price: (ingredient as any).price ?? 0,
      safetyStock: ingredient.safetyStock,
      wasteThreshold: ingredient.wasteThreshold,
    });
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      supplierId: (ingredient as any).supplierId ?? null,
      shelfLifeDays: (ingredient as any).shelfLifeDays ?? 1,
      price: (ingredient as any).price ?? 0,
      safetyStock: ingredient.safetyStock,
      wasteThreshold: ingredient.wasteThreshold,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedIngredient(null);
    setFormData({
      name: '',
      unit: '',
      supplierId: null,
      shelfLifeDays: 1,
      price: 0,
      safetyStock: 0,
      wasteThreshold: 0,
    });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (ingredient: Ingredient) => {
    toggleStatusMutation.mutate(ingredient.id);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.unit || !formData.supplierId) {
      toast.error('Vui lòng nhập tên, chọn đơn vị và nhà cung cấp');
      return;
    }
    if (formData.shelfLifeDays < 1) {
      toast.error('Hạn sử dụng phải lớn hơn 0 ngày');
      return;
    }

    // Check unique name (frontend validation)
    const existingIngredient = ingredients.find(
      item => item.name.toLowerCase() === formData.name.toLowerCase() && item.id !== selectedIngredient?.id
    );
    if (existingIngredient) {
      toast.error('Tên nguyên liệu đã tồn tại');
      return;
    }

    if (selectedIngredient) {
      // Update
      updateMutation.mutate(
        { id: selectedIngredient.id, data: formData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedIngredient(null);
          }
        }
      );
    } else {
      // Create
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedIngredient(null);
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
          title="Quản lý Nguyên vật liệu" 
          subtitle="Quản lý danh sách nguyên vật liệu cho sản xuất"
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
          title="Quản lý Nguyên vật liệu" 
          subtitle="Quản lý danh sách nguyên vật liệu cho sản xuất"
        />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Không thể tải dữ liệu nguyên liệu</p>
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
        title="Quản lý Nguyên vật liệu" 
        subtitle="Quản lý danh sách nguyên vật liệu cho sản xuất"
        action={{
          label: 'Thêm nguyên liệu',
          icon: Plus,
          onClick: handleAdd
        }}
      />

      {/* Search, Filter & Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={() => refetch()} title="Làm mới">
            <RefreshCw size={18} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Tổng: <span className="font-semibold text-foreground">{processedIngredients.length}</span> nguyên liệu
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Tên nguyên liệu
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('unit')}
              >
                <div className="flex items-center">
                  Đơn vị
                  {getSortIcon('unit')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('safetyStock')}
              >
                <div className="flex items-center justify-end">
                  Tồn kho an toàn
                  {getSortIcon('safetyStock')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('wasteThreshold')}
              >
                <div className="flex items-center justify-end">
                  Ngưỡng hao hụt
                  {getSortIcon('wasteThreshold')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Trạng thái
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('updatedAt')}
              >
                <div className="flex items-center">
                  Cập nhật lần cuối
                  {getSortIcon('updatedAt')}
                </div>
              </TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIngredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <Leaf size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Không tìm thấy nguyên liệu nào</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedIngredients.map((ingredient) => (
                <TableRow key={ingredient.id} className={ingredient.status === 'INACTIVE' ? 'opacity-60' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Leaf size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-xs text-muted-foreground">{ingredient.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell className="text-right font-medium">{ingredient.safetyStock}</TableCell>
                  <TableCell className="text-right">{ingredient.wasteThreshold}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ingredient.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {ingredient.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(ingredient.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(ingredient)} title="Xem chi tiết">
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(ingredient)} title="Chỉnh sửa">
                        <Edit size={16} />
                      </Button>
                      <Switch
                        checked={ingredient.status === 'ACTIVE'}
                        onCheckedChange={() => handleToggleStatus(ingredient)}
                        disabled={toggleStatusMutation.isPending}
                        className="ml-2"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">dòng</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Chi tiết nguyên liệu' : selectedIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Tên nguyên liệu <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isViewMode}
                placeholder="VD: Đường đen Okinawa"
              />
            </div>
            <div>
              <Label>Đơn vị tính <span className="text-destructive">*</span></Label>
              <Select 
                value={formData.unit} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, unit: val }))}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g (Gram)</SelectItem>
                  <SelectItem value="pcs">pcs (Cái/Chiếc)</SelectItem>
                  <SelectItem value="ml">ml (Mililit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nhà cung cấp <span className="text-destructive">*</span></Label>
              <Select
                value={formData.supplierId?.toString() ?? ''}
                onValueChange={(val) => setFormData(prev => ({ ...prev, supplierId: Number(val) }))}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'ACTIVE').map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Giá (VNĐ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  disabled={isViewMode}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tồn kho an toàn</Label>
                <Input 
                  type="number"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, safetyStock: Number(e.target.value) }))}
                  disabled={isViewMode}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Ngưỡng hao hụt (%)</Label>
                <Input 
                  type="number"
                  value={formData.wasteThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, wasteThreshold: Number(e.target.value) }))}
                  disabled={isViewMode}
                  placeholder="0"
                />
              </div>
            </div>

            {selectedIngredient && isViewMode && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className={selectedIngredient.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>
                    {selectedIngredient.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                  <span>{formatDateTime(selectedIngredient.updatedAt)}</span>
                </div>
              </div>
            )}

            {!isViewMode && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Hủy
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {selectedIngredient ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IngredientManagement;
