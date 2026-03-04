import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  submitting?: boolean;
  canSubmit: boolean;
  onCreateDraft: () => void;
  onCreateAndSubmit: () => void;
};

const SubmitOrderButton: React.FC<Props> = ({
  submitting,
  canSubmit,
  onCreateDraft,
  onCreateAndSubmit,
}) => {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        disabled={!canSubmit || !!submitting}
        onClick={onCreateDraft}
      >
        Lưu nháp
      </Button>

      <Button
        type="button"
        className="flex-1"
        disabled={!canSubmit || !!submitting}
        onClick={onCreateAndSubmit}
      >
        Gửi đơn hàng
      </Button>
    </div>
  );
};

export default SubmitOrderButton;