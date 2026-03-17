// src/pages/kitchen/ProductionPlanning/components/IssuedIngredientsResultDialog.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IssueIngredientsByProductionPlanResult } from "@/types/kitchen/inventoryIssue.types";

type Props = {
  open: boolean;
  result: IssueIngredientsByProductionPlanResult | null;
  onClose: () => void;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const IssuedIngredientsResultDialog: React.FC<Props> = ({
  open,
  result,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Issued Ingredients Result</DialogTitle>
        </DialogHeader>

        {!result ? null : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Plan ID</p>
                <p className="font-semibold">#{result.productionPlanId}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Plan Date</p>
                <p className="font-semibold">{result.planDate}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Issued At</p>
                <p className="font-semibold">{formatDateTime(result.issuedAt)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-sm text-muted-foreground">Ingredients</p>
                <p className="font-semibold">{result.lines.length}</p>
              </div>
            </div>

            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left">Ingredient</th>
                    <th className="px-3 py-2 text-left">Required Qty</th>
                    <th className="px-3 py-2 text-left">Batch Code</th>
                    <th className="px-3 py-2 text-left">Expired At</th>
                    <th className="px-3 py-2 text-left">Issued Qty</th>
                    <th className="px-3 py-2 text-left">Movement ID</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.flatMap((line) =>
                    line.batches.map((batch) => (
                      <tr
                        key={`${line.ingredientId}-${batch.batchId}-${batch.movementId}`}
                        className="border-t"
                      >
                        <td className="px-3 py-2">{line.ingredientName}</td>
                        <td className="px-3 py-2">{line.requiredQuantity}</td>
                        <td className="px-3 py-2">{batch.batchCode}</td>
                        <td className="px-3 py-2">{batch.expiredAt ?? "--"}</td>
                        <td className="px-3 py-2">{batch.issuedQuantity}</td>
                        <td className="px-3 py-2">{batch.movementId}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IssuedIngredientsResultDialog;