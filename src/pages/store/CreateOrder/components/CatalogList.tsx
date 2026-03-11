import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CatalogItem from "./CatalogItem";
import type { StoreCatalogItem } from "@/types/store/storeCatalog.types";

type Props = {
  loading?: boolean;
  items: StoreCatalogItem[];

  searchTerm: string;
  onSearchTermChange: (v: string) => void;

  onAdd: (item: StoreCatalogItem) => void;
  onRefresh: () => void;
};

const CatalogList: React.FC<Props> = ({
  loading,
  items,
  searchTerm,
  onSearchTermChange,
  onAdd,
  onRefresh,
}) => {
  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>

        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2" size={16} />
          Refresh
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Tìm theo tên / SKU / unit / type..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Đang tải catalog...
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Không có sản phẩm phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((it) => (
            <CatalogItem key={it.productId} item={it} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogList;