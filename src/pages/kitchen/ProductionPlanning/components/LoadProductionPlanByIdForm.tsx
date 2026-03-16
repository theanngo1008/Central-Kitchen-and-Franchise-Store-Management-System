import React from "react";
import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  productionPlanId: string;
  onProductionPlanIdChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

const LoadProductionPlanByIdForm: React.FC<Props> = ({
  productionPlanId,
  onProductionPlanIdChange,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">View Existing Production Plan</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tải chi tiết production plan theo ID từ API GET detail hiện có.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">
            Production Plan ID
          </label>
          <Input
            type="number"
            min={1}
            value={productionPlanId}
            onChange={(e) => onProductionPlanIdChange(e.target.value)}
            placeholder="Nhập production plan id, ví dụ: 2"
            disabled={loading || disabled}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onSubmit}
          disabled={!productionPlanId.trim() || loading || disabled}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Load Plan
        </Button>
      </div>
    </div>
  );
};

export default LoadProductionPlanByIdForm;