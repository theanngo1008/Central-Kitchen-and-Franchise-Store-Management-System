import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import type {
  ProductionPlanDetail,
  ProductionPlanStatus,
} from "@/types/kitchen/productionPlan.types";

type Props = {
  plan: ProductionPlanDetail;
  loading?: boolean;
  onUpdateStatus: (
    nextStatus: ProductionPlanStatus,
    reason: string
  ) => void | Promise<void>;
};

const STATUS_OPTIONS: {
  value: ProductionPlanStatus;
  label: string;
  variant?: "default" | "outline" | "destructive";
}[] = [
  { value: "CONFIRMED", label: "Confirm", variant: "default" },
  { value: "IN_PROGRESS", label: "Start Production", variant: "default" },
  { value: "COMPLETED", label: "Complete", variant: "default" },
  { value: "CANCELLED", label: "Cancel Plan", variant: "destructive" },
];

const getDefaultReason = (status: ProductionPlanStatus, planDate: string) => {
  switch (status) {
    case "CONFIRMED":
      return `Confirm production plan for ${planDate}`;
    case "IN_PROGRESS":
      return "Started production";
    case "COMPLETED":
      return "Production completed";
    case "CANCELLED":
      return "Plan cancelled";
    case "DRAFT":
    default:
      return "";
  }
};

const ProductionPlanStatusActions: React.FC<Props> = ({
  plan,
  loading = false,
  onUpdateStatus,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<ProductionPlanStatus | null>(null);
  const [reason, setReason] = useState("");

  const actions = useMemo(
    () => STATUS_OPTIONS.filter((item) => item.value !== plan.status),
    [plan.status]
  );

  const handleOpenDialog = (status: ProductionPlanStatus) => {
    setSelectedStatus(status);
    setReason(getDefaultReason(status, plan.planDate));
    setOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setSelectedStatus(null);
    setReason("");
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    await onUpdateStatus(selectedStatus, reason.trim());
    setOpen(false);
    setSelectedStatus(null);
    setReason("");
  };

  return (
    <>
      <div className="rounded-xl border bg-background p-4">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Status Actions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cập nhật trạng thái kế hoạch sản xuất
            </p>
          </div>

          <StatusBadge status={plan.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.value}
              type="button"
              variant={action.variant ?? "outline"}
              onClick={() => handleOpenDialog(action.value)}
              disabled={loading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => !loading && setOpen(nextOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Production Plan Status</DialogTitle>
            <DialogDescription>
              Xác nhận cập nhật trạng thái cho production plan #{plan.productionPlanId}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm text-muted-foreground">Next Status</p>
              <p className="mt-1 font-semibold">{selectedStatus ?? "-"}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Reason</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Close
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedStatus || !reason.trim() || loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductionPlanStatusActions;