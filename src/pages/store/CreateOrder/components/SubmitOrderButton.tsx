import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  submitting?: boolean;
  canSubmit: boolean;
  onCreateDraft: () => void;
  onCreateAndSubmit: () => void;
  mode?: "create" | "edit";
};

const SubmitOrderButton: React.FC<Props> = ({
  submitting,
  canSubmit,
  onCreateDraft,
  onCreateAndSubmit,
  mode = "create",
}) => {
  const isEdit = mode === "edit";

  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        disabled={!canSubmit || !!submitting}
        onClick={onCreateDraft}
      >
        {isEdit ? "Lưu chỉnh sửa" : "Lưu nháp"}
      </Button>

      <Button
        type="button"
        className="flex-1"
        disabled={!canSubmit || !!submitting}
        onClick={onCreateAndSubmit}
      >
        {isEdit ? "Cập nhật & Gửi" : "Gửi đơn hàng"}
      </Button>
    </div>
  );
};

export default SubmitOrderButton;