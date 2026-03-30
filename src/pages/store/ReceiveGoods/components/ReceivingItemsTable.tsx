import React from "react";
import { AlertTriangle, CheckCircle2, X, PackageCheck, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { ReceivingDetailItem } from "@/types/store/receiving.types";

type Props = {
  items: ReceivingDetailItem[];
  status?: string;
};

const ItemTypeBadge = ({ type }: { type: string }) => (
  <span
    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
      type === "PRODUCT"
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-700"
    }`}
  >
    {type === "PRODUCT" ? "Thành phẩm" : "Nguyên liệu"}
  </span>
);

const ReceivingItemsTable: React.FC<Props> = ({ items, status }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  
  const toggleRow = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const droppedItems = items.filter((i) => i.isDropped === true);
  const normalItems = items.filter((i) => i.isDropped !== true);
  const isReceived = status === "RECEIVED_BY_STORE";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr className="text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium w-10"></th>
              <th className="px-4 py-3 text-left font-medium">Tên mặt hàng</th>
              <th className="px-3 py-3 text-left font-medium">Loại</th>
              <th className="px-3 py-3 text-center font-medium">SL đặt</th>
              <th className="px-3 py-3 text-center font-medium">SL giao</th>
              {isReceived && (
                <th className="px-3 py-3 text-center font-medium text-primary">SL nhận</th>
              )}
              <th className="px-3 py-3 text-center font-medium">Trạng thái</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((item) => {
              const dropped = item.isDropped === true && (item.deliveredQuantity === 0 || item.deliveredQuantity == null);
              const partial = !dropped && item.expectedQuantity != null && item.deliveredQuantity < item.expectedQuantity;
              const rowId = `${item.itemType}-${item.itemId}`;
              const isExpanded = expandedRows.has(rowId);
              const hasBatches = (item.creditedToFranchiseBatches?.length ?? 0) > 0;

              return (
                <React.Fragment key={rowId}>
                  <tr
                    className={[
                      "transition-colors whitespace-nowrap",
                      dropped ? "bg-destructive/5 hover:bg-destructive/10" : partial ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-muted/5",
                      isExpanded ? "bg-muted/20" : "",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3.5 text-center">
                      {hasBatches && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRow(rowId)}
                        >
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className={`font-medium ${dropped ? "line-through text-muted-foreground" : ""}`}>
                        {item.itemName}
                      </p>
                      {(dropped || partial) && item.dropReason && (
                        <p className="text-[10px] text-destructive italic mt-0.5 max-w-xs truncate">
                          Lý do: {item.dropReason}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <ItemTypeBadge type={item.itemType} />
                    </td>
                    <td className="px-3 py-3.5 text-center text-muted-foreground font-medium">
                      {item.expectedQuantity ?? "-"}
                    </td>
                    <td
                      className={`px-3 py-3.5 text-center font-bold ${
                        dropped ? "text-destructive" : partial ? "text-amber-700" : "text-green-700"
                      }`}
                    >
                      {item.deliveredQuantity}
                      <span className="ml-1 text-[10px] font-normal uppercase opacity-60">
                        {item.unit}
                      </span>
                    </td>
                    {isReceived && (
                      <td className="px-3 py-3.5 text-center font-bold text-primary">
                        {item.receivedQuantity ?? item.deliveredQuantity}
                        <span className="ml-1 text-[10px] font-normal uppercase opacity-60">
                          {item.unit}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3.5 text-center">
                      {dropped ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive uppercase tracking-tighter">
                          <X size={10} /> Bị hủy
                        </span>
                      ) : partial ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-tighter">
                          <AlertTriangle size={10} /> Một phần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-tighter">
                          <CheckCircle2 size={10} /> Đủ
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Batches Expanded Section */}
                  {isExpanded && hasBatches && (
                    <tr className="bg-muted/10 border-b last:border-0 shadow-inner">
                      <td colSpan={isReceived ? 7 : 6} className="px-4 py-4">
                        <div className="pl-12 space-y-3">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                            <Hash size={12} />
                            Chi tiết các lô đã nhập kho ({item.creditedToFranchiseBatches?.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {item.creditedToFranchiseBatches?.map((batch) => (
                              <div 
                                key={batch.batchId} 
                                className="bg-background border-2 border-muted rounded-xl p-3 shadow-sm hover:border-primary/20 transition-colors space-y-2"
                              >
                                <div className="flex justify-between items-center bg-muted/30 px-2 py-1 rounded-md">
                                  <span className="text-[11px] font-bold text-primary truncate">
                                    {batch.batchCode}
                                  </span>
                                  <span className="text-xs font-black">
                                    {batch.quantity} {item.unit}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                                  <span>NSX: {new Date(batch.createdAt).toLocaleDateString("vi-VN")}</span>
                                  {batch.expiredAt && (
                                    <span className={`font-bold ${
                                      new Date(batch.expiredAt) < new Date() ? "text-destructive" : "text-emerald-600"
                                    }`}>
                                      HSD: {new Date(batch.expiredAt).toLocaleDateString("vi-VN")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivingItemsTable;