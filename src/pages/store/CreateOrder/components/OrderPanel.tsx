import React, { useMemo } from "react";
import { ShoppingCart } from "lucide-react";

import OrderDatePicker from "./OrderDatePicker";
import OrderItemRow, { type OrderDraftItem } from "./OrderItemRow";
import OrderNote from "./OrderNote";
import OrderSummary from "./OrderSummary";
import SubmitOrderButton from "./SubmitOrderButton";

type Props = {
  orderDate: string;
  onOrderDateChange: (v: string) => void;

  note: string;
  onNoteChange: (v: string) => void;

  items: OrderDraftItem[];
  onChangeQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;

  onCreateDraft: () => void;
  onCreateAndSubmit: () => void;

  submitting?: boolean;
  canSubmit: boolean;
};

const OrderPanel: React.FC<Props> = ({
  orderDate,
  onOrderDateChange,
  note,
  onNoteChange,
  items,
  onChangeQty,
  onRemoveItem,
  onCreateDraft,
  onCreateAndSubmit,
  submitting,
  canSubmit,
}) => {
  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0);
  }, [items]);

  return (
    <div className="bg-card rounded-xl border p-6 sticky top-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart size={20} />
        Đơn hàng
      </h2>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nhấp vào sản phẩm để thêm vào đơn hàng
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {items.map((it) => (
            <OrderItemRow
              key={it.productId}
              item={it}
              onChangeQty={onChangeQty}
              onRemove={onRemoveItem}
            />
          ))}
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
        />
      </div>
    </div>
  );
};

export default OrderPanel;