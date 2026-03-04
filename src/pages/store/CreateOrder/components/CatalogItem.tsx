import React from "react";
import { Badge } from "@/components/ui/badge";
import type { StoreCatalogItem } from "@/types/store/storeCatalog.types";

type Props = {
  item: StoreCatalogItem;
  onAdd: (item: StoreCatalogItem) => void;
};

const CatalogItem: React.FC<Props> = ({ item, onAdd }) => {
  const disabled = item.status !== "ACTIVE";

  return (
    <div
      className={[
        "flex items-center justify-between p-4 rounded-lg border transition-all",
        disabled
          ? "opacity-60 cursor-not-allowed bg-muted/10"
          : "cursor-pointer hover:border-primary/50 hover:bg-muted/30",
      ].join(" ")}
      onClick={() => {
        if (disabled) return;
        onAdd(item);
      }}
      role="button"
      tabIndex={0}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{item.productName}</p>
          <Badge variant={disabled ? "secondary" : "default"}>
            {item.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {item.productType} • {item.sku}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold">
          {new Intl.NumberFormat("vi-VN").format(item.price ?? 0)} đ
        </p>
        <p className="text-xs text-muted-foreground">/ {item.unit}</p>
      </div>
    </div>
  );
};

export default CatalogItem;