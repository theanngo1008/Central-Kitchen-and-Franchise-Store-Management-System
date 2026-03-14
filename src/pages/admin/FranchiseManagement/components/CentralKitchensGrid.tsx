import React from "react";
import { Factory, MapPin, CheckCircle2, XCircle, Store } from "lucide-react";
import type { AdminCentralKitchen } from "@/types/admin/centralKitchen.types";

type Props = {
  items: AdminCentralKitchen[];
  loading?: boolean;
};

export const CentralKitchensGrid: React.FC<Props> = ({ items, loading }) => {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
        Đang tải dữ liệu bếp trung tâm...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
        Chưa có dữ liệu bếp trung tâm từ API.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((kitchen) => (
        <div
          key={kitchen.centralKitchenId}
          className="rounded-xl border bg-card p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Factory className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold">{kitchen.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID bếp: {kitchen.centralKitchenId}
                </p>
              </div>
            </div>

            {kitchen.status === "ACTIVE" ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                <CheckCircle2 size={12} />
                ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                <XCircle size={12} />
                INACTIVE
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground">
              {kitchen.address}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} />
              <span>{kitchen.location}</span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store size={16} />
              <span>Số cửa hàng trực thuộc</span>
            </div>
            <span className="font-semibold">{kitchen.franchiseCount ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};