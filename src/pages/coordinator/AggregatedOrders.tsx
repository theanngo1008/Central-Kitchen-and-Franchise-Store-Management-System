import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Plus, Calendar, AlertTriangle, ArrowRight, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Query hooks
import { 
  useDemands, 
  useDemandDetail, 
  useCreateDemand, 
  useAddDemandItem 
} from '@/hooks/supply/useDemands';
import { useProducts } from '@/hooks/products';

const AggregatedOrders: React.FC = () => {
  // Demand Tab State
  const [selectedDemandId, setSelectedDemandId] = useState<number | null>(null);
  const [newPlanDate, setNewPlanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [addingProductId, setAddingProductId] = useState<number | ''>('');
  const [addingQuantity, setAddingQuantity] = useState<number | ''>('');

  // Queries
  const { data: demands = [], isLoading: loadingDemands } = useDemands();
  const { data: demandDetail, isLoading: loadingDetail } = useDemandDetail(selectedDemandId);
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  
  // Mutations
  const createDemand = useCreateDemand();
  const addItem = useAddDemandItem(selectedDemandId);

  const products = productsData?.data || [];

  // Handlers
  const handleCreateDemand = (e: React.FormEvent) => {
    e.preventDefault();
    createDemand.mutate({ planDate: newPlanDate }, {
      onSuccess: (newId) => setSelectedDemandId(newId)
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemandId || !addingProductId || !addingQuantity) return;
    
    addItem.mutate({ 
      productId: Number(addingProductId), 
      quantity: Number(addingQuantity) 
    }, {
      onSuccess: () => {
        setAddingProductId('');
        setAddingQuantity('');
      }
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Tổng hợp & Phân bổ" 
        subtitle="Quản lý tổng cầu từ hệ thống và điều phối nguồn cung"
      />

      <Tabs defaultValue="demand" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="demand">Tổng hợp nhu cầu</TabsTrigger>
          <TabsTrigger value="allocation">Phân bổ nguồn cung</TabsTrigger>
        </TabsList>

        {/* TAB 1: DEMAND AGGREGATION */}
        <TabsContent value="demand" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: List of Demands */}
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar size={18} /> Các đợt tổng hợp (Plan Date)
              </h2>
              
              <form onSubmit={handleCreateDemand} className="flex gap-2">
                <Input 
                  type="date" 
                  value={newPlanDate} 
                  onChange={(e) => setNewPlanDate(e.target.value)} 
                  required
                />
                <Button type="submit" disabled={createDemand.isPending}>
                  <Plus size={16} className="mr-1" /> Tạo
                </Button>
              </form>

              <div className="space-y-2 mt-4 max-h-[500px] overflow-y-auto">
                {loadingDemands ? (
                  <div className="text-center text-muted-foreground text-sm py-4">Đang tải...</div>
                ) : demands.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">Chưa có dữ liệu</div>
                ) : (
                  [...demands].sort((a,b) => b.demandAggregationId - a.demandAggregationId).map(demand => (
                    <div 
                      key={demand.demandAggregationId}
                      onClick={() => setSelectedDemandId(demand.demandAggregationId)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDemandId === demand.demandAggregationId 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-medium"> Kế hoạch: {format(new Date(demand.planDate), 'dd/MM/yyyy')}</div>
                      <div className="text-xs text-muted-foreground">ID: #{demand.demandAggregationId}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Detailed Demand Items */}
            <div className="lg:col-span-2 bg-card rounded-xl border p-5">
              {!selectedDemandId ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p>Chọn một đợt tổng hợp bên trái để xem chi tiết</p>
                </div>
              ) : loadingDetail ? (
                <div className="h-full min-h-[400px] flex items-center justify-center">Đang tải chi tiết...</div>
              ) : demandDetail ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Chi tiết Kế hoạch #{demandDetail.demandAggregationId}</h2>
                      <p className="text-sm text-muted-foreground">Ngày: {format(new Date(demandDetail.planDate), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>

                  {/* Add Item Form */}
                  <form onSubmit={handleAddItem} className="flex gap-3 items-end bg-muted/40 p-4 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium">Sản phẩm / Nguyên liệu</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={addingProductId}
                        onChange={(e) => setAddingProductId(Number(e.target.value))}
                        required
                      >
                        <option value="" disabled>-- Chọn sản phẩm --</option>
                        {products.map(p => (
                          <option key={p.productId} value={p.productId}>{p.name} ({p.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-xs font-medium">Số lượng</label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={addingQuantity} 
                        onChange={(e) => setAddingQuantity(Number(e.target.value))} 
                        required 
                      />
                    </div>
                    <Button type="submit" disabled={addItem.isPending}>
                      Thêm mã
                    </Button>
                  </form>

                  {/* Detail Items List */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Danh sách tổng hợp ({demandDetail.demandItems?.length || 0})</h3>
                    {demandDetail.demandItems?.map(item => (
                      <div key={item.demandItemId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-start gap-3">
                          <Package className="text-primary mt-0.5" size={18} />
                          <div>
                            <p className="font-medium">{item.product?.name || `Product ID: ${item.productId}`}</p>
                            <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.product?.unit}</span></p>
                        </div>
                      </div>
                    ))}
                    {!demandDetail.demandItems?.length && (
                      <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu sản phẩm trong đợt này</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">Lỗi không tìm thấy dữ liệu</div>
              )}
            </div>
          </div>
        </TabsContent>


        {/* TAB 2: SUPPLY ALLOCATION (MOCK UI DEMO) */}
        <TabsContent value="allocation" className="mt-6">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Riêng mặt hàng thiếu hụt <AlertTriangle className="text-destructive" size={18} />
                </h2>
                <p className="text-sm text-muted-foreground">Các mã có Nhu cầu tổng cao hơn Tồn kho kho tổng</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Mock Shortage Item 1 */}
              <div className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-destructive/5 border-destructive/20">
                <div>
                  <h3 className="font-semibold text-lg">Cà phê rang xay Robusta</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Tổng Cầu: <strong className="text-foreground">150 kg</strong></span>
                    <span>Tồn kho: <strong className="text-destructive">100 kg</strong></span>
                    <span>Thiếu: <strong>50 kg</strong></span>
                  </div>
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="destructive" className="shrink-0 gap-2">
                      Phân bổ lại <Settings2 size={16} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Phân bổ: Cà phê rang xay Robusta</SheetTitle>
                      <SheetDescription>
                        Hiện có 100 kg tồn kho. Cần phân bổ lại cho 3 cửa hàng bên dưới.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>Chi nhánh Quận 1 (Cầu: 60)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input type="number" defaultValue="40" className="w-24 font-bold" /> 
                          <span className="text-sm text-muted-foreground">kg (Duyệt)</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>Chi nhánh Gò Vấp (Cầu: 50)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input type="number" defaultValue="30" className="w-24 font-bold" /> 
                          <span className="text-sm text-muted-foreground">kg (Duyệt)</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>Chi nhánh Thủ Đức (Cầu: 40)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input type="number" defaultValue="30" className="w-24 font-bold" /> 
                          <span className="text-sm text-muted-foreground">kg (Duyệt)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t flex items-center justify-between">
                      <div className="text-sm">
                        Tổng đang chia: <strong className="text-primary text-lg">100</strong> / 100 kg
                      </div>
                      <Button>Lưu Phân bổ</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

               {/* Mock Shortage Item 2 */}
               <div className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-destructive/5 border-destructive/20">
                <div>
                  <h3 className="font-semibold text-lg">Sữa chua dẻo</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Tổng Cầu: <strong className="text-foreground">200 hộp</strong></span>
                    <span>Tồn kho: <strong className="text-destructive">50 hộp</strong></span>
                    <span>Thiếu: <strong>150 hộp</strong></span>
                  </div>
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="destructive" className="shrink-0 gap-2">
                      Phân bổ lại <Settings2 size={16} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Phân bổ: Sữa chua dẻo</SheetTitle>
                      <SheetDescription>
                        Không đủ dữ liệu thực tế cho Demo thứ 2.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>

            </div>
          </div>
        </TabsContent>

      </Tabs>

    </div>
  );
};

export default AggregatedOrders;
