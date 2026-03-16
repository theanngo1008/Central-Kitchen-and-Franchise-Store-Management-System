import React from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  planDate: string;
  onPlanDateChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
};

const CreateProductionPlanForm: React.FC<Props> = ({
  planDate,
  onPlanDateChange,
  onSubmit,
  loading = false,
  disabled = false,
}) => {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Create Production Plan</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn ngày để tạo kế hoạch sản xuất. Hệ thống sẽ tự gom các đơn hàng
          LOCKED trong ngày đó.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Plan Date</label>
          <Input
            type="date"
            value={planDate}
            onChange={(e) => onPlanDateChange(e.target.value)}
            disabled={loading || disabled}
          />
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={!planDate || loading || disabled}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CalendarPlus className="mr-2 h-4 w-4" />
          )}
          Create Plan
        </Button>
      </div>
    </div>
  );
};

export default CreateProductionPlanForm;