import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Ingredient } from "@/types/ingredient";

type Props = {
  loading?: boolean;
  items: Ingredient[];
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  onAdd: (item: Ingredient) => void;
};

const IngredientCatalogList: React.FC<Props> = ({
  loading,
  items,
  searchTerm,
  onSearchTermChange,
  onAdd,
}) => {
  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Danh sách nguyên liệu</h2>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Tìm theo tên nguyên liệu / đơn vị..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Đang tải danh sách nguyên liệu...
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Không có nguyên liệu phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const disabled = item.status !== "ACTIVE";
            return (
              <div
                key={item.id}
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
                    <p className="font-medium truncate">{item.name}</p>
                    <Badge variant={disabled ? "secondary" : "outline"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Đơn vị: {item.unit}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <p className="font-semibold text-muted-foreground text-sm">
                    {item.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IngredientCatalogList;
