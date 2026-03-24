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

const getLocalDateString = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const toUtcISOStringFromLocalDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  return localDate.toISOString();
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
  const [createdAt, setCreatedAt] = useState(getLocalDateString());
  const [reason, setReason] = useState("");

  const [quantityTouched, setQuantityTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    setItemId("");
    setBatchCode("");
    setQuantity("");
    setCreatedAt(getLocalDateString());
    setReason("");
    setQuantityTouched(false);
    setDateTouched(false);
  }, [open, activeTab]);

  const options =
    activeTab === "INGREDIENT" ? ingredientOptions : productOptions;

  const quantityNumber = useMemo(() => Number(quantity), [quantity]);
  const today = getLocalDateString();

  const isInvalidQuantity =
    !quantity.trim() ||
    Number.isNaN(quantityNumber) ||
    quantityNumber <= 0 ||
    !Number.isInteger(quantityNumber);

  const showQuantityError = quantityTouched && isInvalidQuantity;

  const isFutureCreatedAt = !!createdAt && createdAt > today;
  const showDateError = dateTouched && isFutureCreatedAt;

  const catalogLoadFailed =
    !loadingOptions && optionsError && options.length === 0;

  const hasNoOptions = !loadingOptions && !optionsError && options.length === 0;

  const isDisabled =
    submitting ||
    loadingOptions ||
    catalogLoadFailed ||
    hasNoOptions ||
    !itemId ||
    !batchCode.trim() ||
    !createdAt ||
    isFutureCreatedAt ||
    isInvalidQuantity;

  const handleSubmit = async () => {
    setQuantityTouched(true);
    setDateTouched(true);

    if (isDisabled) return;

    await onSubmit({
      itemId: Number(itemId),
      batchCode: batchCode.trim(),
      quantity: quantityNumber,
      createdAtUtc: toUtcISOStringFromLocalDate(createdAt),
      reason: reason.trim() || undefined,
    });
  };

  const itemLabel = activeTab === "INGREDIENT" ? "Nguyên liệu" : "Sản phẩm";

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "INGREDIENT"
              ? "Nhập lô nguyên liệu"
              : "Nhập lô sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{itemLabel}</Label>
            <Select
              value={itemId}
              onValueChange={setItemId}
              disabled={loadingOptions || catalogLoadFailed || hasNoOptions}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Đang tải danh sách..."
                      : `Chọn ${itemLabel.toLowerCase()}`
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

            {catalogLoadFailed ? (
              <p className="text-sm text-destructive">
                Không tải được danh sách lựa chọn.
              </p>
            ) : null}

            {hasNoOptions ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu để tạo lô mới.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchCode">Mã lô</Label>
            <Input
              id="batchCode"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="Ví dụ: LO-ING-20260324-01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => setQuantityTouched(true)}
              placeholder="Nhập số lượng"
            />
            {showQuantityError ? (
              <p className="text-sm text-destructive">
                Số lượng phải là số nguyên dương.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdAt">Ngày nhập lô</Label>
            <Input
              id="createdAt"
              type="date"
              value={createdAt}
              max={today}
              onChange={(e) => setCreatedAt(e.target.value)}
              onBlur={() => setDateTouched(true)}
            />
            {showDateError ? (
              <p className="text-sm text-destructive">
                Ngày nhập lô không được lớn hơn ngày hiện tại.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Ghi chú</Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: nhập kho đầu ngày, nhận từ NCC..."
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
