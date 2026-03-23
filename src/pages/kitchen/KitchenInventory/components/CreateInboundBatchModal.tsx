import React, { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { KitchenInventoryTab } from "@/types/kitchen/inventoryBatch.types";

type Option = {
  value: number;
  label: string;
};

type Props = {
  open: boolean;
  activeTab: KitchenInventoryTab;
  ingredientOptions: Option[];
  productOptions: Option[];
  loadingOptions?: boolean;
  optionsError?: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    itemId: number;
    batchCode: string;
    quantity: number;
    createdAtUtc: string;
    reason?: string;
  }) => void | Promise<void>;
};

const toLocalDateTimeInputValue = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

const CreateInboundBatchModal: React.FC<Props> = ({
  open,
  activeTab,
  ingredientOptions,
  productOptions,
  loadingOptions = false,
  optionsError = false,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [itemId, setItemId] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [createdAt, setCreatedAt] = useState(toLocalDateTimeInputValue());
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setItemId("");
    setBatchCode("");
    setQuantity("");
    setCreatedAt(toLocalDateTimeInputValue());
    setReason("");
  }, [open, activeTab]);

  const options = activeTab === "INGREDIENT" ? ingredientOptions : productOptions;

  const quantityNumber = useMemo(() => Number(quantity), [quantity]);

  const isInvalidQuantity =
    !quantity.trim() ||
    Number.isNaN(quantityNumber) ||
    quantityNumber <= 0 ||
    !Number.isInteger(quantityNumber);

  const hasNoOptions = !loadingOptions && !optionsError && options.length === 0;

  const isDisabled =
    submitting ||
    loadingOptions ||
    optionsError ||
    hasNoOptions ||
    !itemId ||
    !batchCode.trim() ||
    !createdAt ||
    isInvalidQuantity;

  const handleSubmit = async () => {
    if (isDisabled) return;

    await onSubmit({
      itemId: Number(itemId),
      batchCode: batchCode.trim(),
      quantity: Number(quantityNumber),
      createdAtUtc: new Date(createdAt).toISOString(),
      reason: reason.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "INGREDIENT" ? "Nhập lô nguyên liệu" : "Nhập lô sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{activeTab === "INGREDIENT" ? "Nguyên liệu" : "Sản phẩm"}</Label>

            <Select
              value={itemId}
              onValueChange={setItemId}
              disabled={loadingOptions || optionsError || hasNoOptions}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Đang tải dữ liệu..."
                      : optionsError
                        ? "Không tải được danh sách mặt hàng"
                        : hasNoOptions
                          ? "Không có mặt hàng khả dụng"
                          : "Chọn mặt hàng"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {optionsError ? (
              <p className="text-sm text-destructive">
                Không có quyền tải danh sách mặt hàng. BE đang trả 403 cho danh sách{" "}
                {activeTab === "INGREDIENT" ? "nguyên liệu" : "sản phẩm"}.
              </p>
            ) : null}

            {hasNoOptions ? (
              <p className="text-sm text-muted-foreground">
                Hiện chưa có mặt hàng nào khả dụng để nhập lô.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Mã lô</Label>
            <Input
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="Nhập mã lô"
            />
          </div>

          <div className="space-y-2">
            <Label>Số lượng</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Nhập số lượng"
            />
            {isInvalidQuantity && quantity.trim() ? (
              <p className="text-sm text-destructive">
                Số lượng phải là số nguyên lớn hơn 0.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Ngày tạo lô</Label>
            <Input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Lý do nhập kho</Label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do nhập kho..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isDisabled}>
              {submitting ? "Đang tạo..." : "Tạo lô"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInboundBatchModal;