import React, { useMemo } from "react";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { formatCurrency } from "@/utils";

import OrderDatePicker from "./OrderDatePicker";
import OrderItemRow, { type OrderDraftItem } from "./OrderItemRow";
import OrderNote from "./OrderNote";
import OrderSummary from "./OrderSummary";
import SubmitOrderButton from "./SubmitOrderButton";
import type { IngredientDraftItem } from "../index";

type Props = {
  orderDate: string;
  onOrderDateChange: (v: string) => void;

  note: string;
  onNoteChange: (v: string) => void;

  items: OrderDraftItem[];
  onChangeQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;

  ingredientItems: IngredientDraftItem[];
  onChangeIngredientQty: (ingredientId: number, qty: number) => void;
  onRemoveIngredient: (ingredientId: number) => void;

  onCreateDraft: () => void;
  onCreateAndSubmit: () => void;

  submitting?: boolean;
  canSubmit: boolean;
  mode?: "create" | "edit";
};

const OrderPanel: React.FC<Props> = ({
  orderDate,
  onOrderDateChange,
  note,
  onNoteChange,
  items,
  onChangeQty,
  onRemoveItem,
  ingredientItems,
  onChangeIngredientQty,
  onRemoveIngredient,
  onCreateDraft,
  onCreateAndSubmit,
  submitting,
  canSubmit,
  mode = "create",
}) => {
  const total = useMemo(() => {
    const productTotal = items.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0);
    const ingredientTotal = ingredientItems.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0);
    return productTotal + ingredientTotal;
  }, [items, ingredientItems]);

  const isEmpty = items.length === 0 && ingredientItems.length === 0;

  return (
    <div className="bg-card rounded-xl border p-6 sticky top-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart size={20} />
        {mode === "edit" ? "Chỉnh sửa đơn hàng" : "Đơn hàng"}
      </h2>

      {isEmpty ? (
        <p className="text-muted-foreground text-center py-8">
          Nhấp vào sản phẩm hoặc nguyên liệu để thêm vào đơn hàng
        </p>
      ) : (
        <div className="space-y-4 mb-6">
          {/* Product items */}
          {items.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <ShoppingCart size={12} /> Sản phẩm ({items.length})
              </p>
              <div className="space-y-2">
                {items.map((it) => (
                  <OrderItemRow
                    key={it.productId}
                    item={it}
                    onChangeQty={onChangeQty}
                    onRemove={onRemoveItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ingredient items */}
          {ingredientItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <FlaskConical size={12} /> Nguyên liệu ({ingredientItems.length})
              </p>
              <div className="space-y-2">
                {ingredientItems.map((it) => (
                  <div
                    key={it.ingredientId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{it.ingredientName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {it.quantity} {it.unit}
                        </p>
                        {it.price != null && (
                          <p className="text-xs font-medium text-blue-700">
                             ({formatCurrency(it.price * it.quantity)})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onChangeIngredientQty(it.ingredientId, it.quantity - 1)}
                        className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-sm font-bold"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={it.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onChangeIngredientQty(it.ingredientId, isNaN(val) ? 0 : val);
                        }}
                        className="w-12 text-center text-sm font-medium bg-transparent border rounded h-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => onChangeIngredientQty(it.ingredientId, it.quantity + 1)}
                        className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-sm font-bold"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveIngredient(it.ingredientId)}
                        className="w-7 h-7 rounded bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 text-destructive ml-1 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t pt-4 space-y-4">
        <OrderDatePicker value={orderDate} onChange={onOrderDateChange} />
        <OrderNote value={note} onChange={onNoteChange} />
        <OrderSummary total={total} />

        <SubmitOrderButton
          submitting={submitting}
          canSubmit={canSubmit}
          onCreateDraft={onCreateDraft}
          onCreateAndSubmit={onCreateAndSubmit}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default OrderPanel;