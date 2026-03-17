// src/pages/kitchen/ProductionPlanning/components/IssueIngredientsDialog.tsx

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void | Promise<void>;
};

const IssueIngredientsDialog: React.FC<Props> = ({
  open,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    if (loading) return;
    setReason("");
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit(reason.trim());
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !loading && !nextOpen && handleClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Ingredients by Production Plan</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động xuất kho nguyên vật liệu theo FEFO dựa trên
            production plan.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reason (optional)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do xuất kho..."
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Close
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Issue Ingredients
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IssueIngredientsDialog;
