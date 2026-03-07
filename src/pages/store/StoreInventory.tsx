import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/input';
import { mockProducts, Product } from '@/data/mockData';
import { Search, AlertTriangle } from 'lucide-react';

const StoreInventory: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'id', label: 'Mã SP' },
    { key: 'name', label: 'Tên sản phẩm' },
    { key: 'category', label: 'Danh mục' },
    { 
      key: 'stock', 
      label: 'Tồn kho hiện tại',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <span className={product.stock <= product.minStock ? 'text-destructive font-medium' : ''}>
            {product.stock} {product.unit}
          </span>
          {product.stock <= product.minStock && (
            <AlertTriangle size={16} className="text-destructive" />
          )}
        </div>
      )
    },
    { 
      key: 'minStock', 
      label: 'Tồn kho tối thiểu',
      render: (product: Product) => `${product.minStock} ${product.unit}`
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (product: Product) => {
        if (product.stock <= product.minStock) {
          return <span className="status-badge status-cancelled">Sắp hết</span>;
        }
        if (product.stock <= product.minStock * 1.5) {
          return <span className="status-badge status-pending">Cần đặt thêm</span>;
        }
        return <span className="status-badge status-delivered">Đủ hàng</span>;
      }
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Tồn kho cửa hàng" 
        subtitle="Tồn kho hiện tại tại Chi nhánh Quận 1"
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
          <p className="text-2xl font-semibold">{mockProducts.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Sản phẩm sắp hết</p>
          <p className="text-2xl font-semibold text-destructive">
            {mockProducts.filter(p => p.stock <= p.minStock).length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Danh mục</p>
          <p className="text-2xl font-semibold">
            {new Set(mockProducts.map(p => p.category)).size}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filteredProducts} />
    </div>
  );
};

export default StoreInventory;