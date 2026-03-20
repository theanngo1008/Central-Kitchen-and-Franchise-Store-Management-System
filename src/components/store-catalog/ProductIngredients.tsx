import React from 'react';
import { useBoms } from '@/hooks/manager/useBom';
import { Loader2, Beaker } from 'lucide-react';

interface ProductIngredientsProps {
  productId: number;
}

export const ProductIngredients: React.FC<ProductIngredientsProps> = ({ productId }) => {
  const { data: bomsResponse, isLoading, isError } = useBoms({ 
    productId, 
    status: 'ACTIVE',
    pageSize: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 px-6 bg-muted/10 animate-in slide-in-from-top-2 fade-in duration-200">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Đang tải thành phần...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 px-6 bg-destructive/5 text-destructive text-sm border-t animate-in slide-in-from-top-2 fade-in duration-200">
        Không thể tải thông tin thành phần.
      </div>
    );
  }

  const activeBom = bomsResponse?.data?.items?.[0];
  const items = activeBom?.items || [];

  if (!activeBom || items.length === 0) {
    return (
      <div className="flex items-center text-muted-foreground py-6 px-6 bg-muted/10 border-t animate-in slide-in-from-top-2 fade-in duration-200">
        <Beaker className="w-4 h-4 mr-2 opacity-50" />
        <span className="text-sm">Chưa có danh sách thành phần cho sản phẩm này.</span>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 p-4 border-t px-6 animate-in slide-in-from-top-2 fade-in duration-200">
      <h4 className="text-sm font-semibold mb-3 flex items-center text-foreground">
        <Beaker className="w-4 h-4 mr-2 text-primary" />
        Danh sách thành phần (BOM)
      </h4>
      <div className="bg-background rounded-md border overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Thành phần</th>
              <th className="px-4 py-2 font-medium text-right">Định lượng</th>
              <th className="px-4 py-2 font-medium">Đơn vị</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10">
                <td className="px-4 py-3 font-medium">{item.ingredientName}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.ingredientUnit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
