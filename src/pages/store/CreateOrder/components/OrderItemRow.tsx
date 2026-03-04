import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

export type OrderDraftItem = {
  productId: number;
  productName: string;
  unit: string;
  price?: number;
  quantity: number;
};

type Props = {
  item: OrderDraftItem;
  onChangeQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
};

const OrderItemRow: React.FC<Props> = ({ item, onChangeQty, onRemove }) => {
  const unitPrice = item.price ?? 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.productName}</p>
        <p className="text-xs text-muted-foreground">
          {new Intl.NumberFormat("vi-VN").format(unitPrice)} đ × {item.quantity}{" "}
          {item.unit}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChangeQty(item.productId, item.quantity - 1)}
          className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
        >
          <Minus size={14} />
        </button>

        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onChangeQty(item.productId, item.quantity + 1)}
          className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
        >
          <Plus size={14} />
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="w-7 h-7 rounded bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 text-destructive ml-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default OrderItemRow;