import React from "react";
import { CalendarDays, ClipboardList, Package2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProductionPlanDetail } from "@/types/kitchen/productionPlan.types";

type Props = {
  plan: ProductionPlanDetail;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const ProductionPlanSummaryCard: React.FC<Props> = ({ plan }) => {
  const totalQuantity = plan.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Production Plan Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tổng quan kế hoạch sản xuất theo ngày
          </p>
        </div>

        <StatusBadge status={plan.status} />
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <ClipboardList size={16} />
            <span className="text-sm">Plan ID</span>
          </div>
          <p className="text-lg font-semibold">#{plan.productionPlanId}</p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <CalendarDays size={16} />
            <span className="text-sm">Plan Date</span>
          </div>
          <p className="text-lg font-semibold">{formatDate(plan.planDate)}</p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Package2 size={16} />
            <span className="text-sm">Total Quantity</span>
          </div>
          <p className="text-lg font-semibold">{totalQuantity}</p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <CalendarDays size={16} />
            <span className="text-sm">Created At</span>
          </div>
          <p className="text-sm font-medium">{formatDateTime(plan.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionPlanSummaryCard;