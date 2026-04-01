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
  Leaf,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/common/Pagination';
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
  const ingredients: Ingredient[] = useMemo(() => {
    if (!ingredientsResponse) return [];
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

  // Pagination logic
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
    toggleStatusMutation.mutate(ingredient.id, {
      onSuccess: () => {
        toast.success(`Đã ${ingredient.status === 'ACTIVE' ? 'ngưng hoạt động' : 'kích hoạt'} nguyên liệu`);
      },
      onError: (error: any) => {
        const status = error.response?.status;
        if (status === 409 || status === 500) {
          toast.error('Nguyên liệu này không thể ngưng hoạt động vì đã có dữ liệu liên quan (đơn hàng hoặc công thức).');
        } else {
          toast.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái nguyên liệu');
        }
      }
    });
  };

  const handleSave = async () => {
    const trimmedName = formData.name.trim();
    const trimmedUnit = formData.unit.trim();

    if (!trimmedName) {
      toast.error('Vui lòng nhập tên nguyên liệu');
      return;
    }
    if (!trimmedUnit) {
      toast.error('Vui lòng nhập/chọn đơn vị tính');
      return;
    }
    if (!formData.supplierId) {
      toast.error('Vui lòng chọn nhà cung cấp');
      return;
    }

    if (formData.shelfLifeDays < 1) {
      toast.error('Hạn sử dụng phải ít nhất là 1 ngày');
      return;
    }
    if (formData.price < 0) {
      toast.error('Giá sản phẩm không được là số âm');
      return;
    }
    if (formData.safetyStock < 0) {
      toast.error('Tồn kho an toàn không được là số âm');
      return;
    }
    if (formData.wasteThreshold < 0 || formData.wasteThreshold > 100) {
      toast.error('Ngưỡng hao hụt phải từ 0% đến 100%');
      return;
    }

    const payload = { 
      ...formData, 
      name: trimmedName,
      unit: trimmedUnit 
    };

    if (selectedIngredient) {
      updateMutation.mutate(
        { id: selectedIngredient.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật nguyên liệu thành công');
            setIsDialogOpen(false);
            setSelectedIngredient(null);
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Không thể cập nhật nguyên liệu');
          }
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Thêm nguyên liệu mới thành công');
          setIsDialogOpen(false);
          setSelectedIngredient(null);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Không thể thêm nguyên liệu');
        }
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Quản lý Nguyên vật liệu" subtitle="Đang tải dữ liệu..." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Quản lý Nguyên vật liệu" subtitle="Lỗi tải dữ liệu" />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Không thể tải dữ liệu nguyên liệu</p>
          <Button onClick={() => refetch()} variant="outline">Thử lại</Button>
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
        
        <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
          Tổng: <span className="font-semibold text-foreground">{processedIngredients.length}</span> nguyên liệu
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">Tên nguyên liệu {getSortIcon('name')}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('unit')}>
                <div className="flex items-center">Đơn vị {getSortIcon('unit')}</div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('safetyStock')}>
                <div className="flex items-center justify-end">Tồn kho an toàn {getSortIcon('safetyStock')}</div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort('wasteThreshold')}>
                <div className="flex items-center justify-end">Hao hụt {getSortIcon('wasteThreshold')}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">Trạng thái {getSortIcon('status')}</div>
              </TableHead>
              <TableHead>Cập nhật cuối</TableHead>
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
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Leaf size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{ingredient.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{ingredient.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell className="text-right font-medium">{ingredient.safetyStock.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{ingredient.wasteThreshold}%</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      ingredient.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {ingredient.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(ingredient.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(ingredient)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(ingredient)}>
                        <Edit size={14} />
                      </Button>
                      <Switch
                        checked={ingredient.status === 'ACTIVE'}
                        onCheckedChange={() => handleToggleStatus(ingredient)}
                        disabled={toggleStatusMutation.isPending}
                        className="scale-90 ml-1"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'Chi tiết nguyên liệu' : selectedIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Tên nguyên liệu <span className="text-destructive">*</span></Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isViewMode}
                placeholder="VD: Đường đen Okinawa"
              />
            </div>
            <div className="space-y-2">
              <Label>Đơn vị tính <span className="text-destructive">*</span></Label>
              <Select
                value={formData.unit}
                onValueChange={(val) => setFormData(prev => ({ ...prev, unit: val }))}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="ml">Mililit (ml)</SelectItem>
                  <SelectItem value="pcs">Cái/Viên (pcs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
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
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hạn sử dụng (ngày)</Label>
                <Input
                  type="number"
                  value={formData.shelfLifeDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, shelfLifeDays: Number(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Giá (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tồn kho an toàn</Label>
                <Input 
                  type="number"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, safetyStock: Number(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngưỡng hao hụt (%)</Label>
                <Input 
                  type="number"
                  value={formData.wasteThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, wasteThreshold: Number(e.target.value) }))}
                  disabled={isViewMode}
                />
              </div>
            </div>

            {!isViewMode && (
              <div className="flex gap-3 pt-6">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Hủy
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Lưu
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
