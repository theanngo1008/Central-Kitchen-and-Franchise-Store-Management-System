import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KitchenInventoryBatchLifecycle } from "@/types/kitchen/inventoryHistory.types";
import BatchLifecycleHeader from "./BatchLifecycleHeader";
import BatchLifecycleTimeline from "./BatchLifecycleTimeline";

type Props = {
  open: boolean;
  loading?: boolean;
  lifecycle: KitchenInventoryBatchLifecycle | null;
  onClose: () => void;
};

const BatchLifecycleDialog: React.FC<Props> = ({
  open,
  loading = false,
  lifecycle,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vòng đời lô hàng</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-muted-foreground">
            Đang tải vòng đời batch...
          </div>
        ) : !lifecycle ? (
          <div className="py-6 text-sm text-muted-foreground">
            Không có dữ liệu vòng đời cho batch này.
          </div>
        ) : (
          <div className="space-y-4">
            <BatchLifecycleHeader lifecycle={lifecycle} />
            <BatchLifecycleTimeline timeline={lifecycle.timeline} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BatchLifecycleDialog;