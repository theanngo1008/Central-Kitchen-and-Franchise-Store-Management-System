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

const toUtcISOStringFromLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
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

  const [itemTouched, setItemTouched] = useState(false);
  const [batchCodeTouched, setBatchCodeTouched] = useState(false);
  const [quantityTouched, setQuantityTouched] = useState(false);
  const [createdAtTouched, setCreatedAtTouched] = useState(false);

  const options = useMemo(
    () => (activeTab === "INGREDIENT" ? ingredientOptions : productOptions),
    [activeTab, ingredientOptions, productOptions],
  );

  const quantityNumber = Number(quantity);
  const today = getLocalDateString();

  const itemError =
    !itemId.trim() ? "Vui lòng chọn mục cần nhập kho." : undefined;

  const batchCodeError = !batchCode.trim()
    ? "Vui lòng nhập mã lô."
    : batchCode.trim().length > 100
      ? "Mã lô không được vượt quá 100 ký tự."
      : undefined;

  const quantityError =
    quantity.trim() === ""
      ? "Vui lòng nhập số lượng."
      : Number.isNaN(quantityNumber) || quantityNumber <= 0
        ? "Số lượng phải lớn hơn 0."
        : undefined;

  const createdAtError = !createdAt
    ? "Vui lòng chọn ngày tạo lô."
    : createdAt > today
      ? "Ngày tạo lô không được ở tương lai."
      : undefined;

  const resetForm = () => {
    setItemId("");
    setBatchCode("");
    setQuantity("");
    setCreatedAt(getLocalDateString());
    setReason("");

    setItemTouched(false);
    setBatchCodeTouched(false);
    setQuantityTouched(false);
    setCreatedAtTouched(false);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setItemTouched(true);
    setBatchCodeTouched(true);
    setQuantityTouched(true);
    setCreatedAtTouched(true);

    if (itemError || batchCodeError || quantityError || createdAtError) {
      return;
    }

    await onSubmit({
      itemId: Number(itemId),
      batchCode: batchCode.trim().toUpperCase(),
      quantity: quantityNumber,
      createdAtUtc: toUtcISOStringFromLocalDate(createdAt),
      reason: reason.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "INGREDIENT"
              ? "Nhập lô nguyên liệu"
              : "Nhập lô sản phẩm"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              {activeTab === "INGREDIENT" ? "Nguyên liệu" : "Sản phẩm"}
            </Label>

            <Select
              value={itemId}
              onValueChange={(value) => {
                setItemId(value);
                setItemTouched(true);
              }}
              disabled={loadingOptions || submitting}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Đang tải danh sách..."
                      : activeTab === "INGREDIENT"
                        ? "Chọn nguyên liệu"
                        : "Chọn sản phẩm"
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
                Không tải được danh sách lựa chọn.
              </p>
            ) : null}

            {!loadingOptions && !optionsError && options.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Không có dữ liệu để lựa chọn.
              </p>
            ) : null}

            {itemTouched && itemError ? (
              <p className="text-sm text-destructive">{itemError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchCode">Mã lô</Label>
            <Input
              id="batchCode"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              onBlur={() => setBatchCodeTouched(true)}
              placeholder="Ví dụ: BATCH-001"
              disabled={submitting}
            />
            {batchCodeTouched && batchCodeError ? (
              <p className="text-sm text-destructive">{batchCodeError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => setQuantityTouched(true)}
              placeholder="Nhập số lượng"
              disabled={submitting}
            />
            {quantityTouched && quantityError ? (
              <p className="text-sm text-destructive">{quantityError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdAt">Ngày tạo lô</Label>
            <Input
              id="createdAt"
              type="date"
              value={createdAt}
              max={today}
              onChange={(e) => setCreatedAt(e.target.value)}
              onBlur={() => setCreatedAtTouched(true)}
              disabled={submitting}
            />
            {createdAtTouched && createdAtError ? (
              <p className="text-sm text-destructive">{createdAtError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do nhập kho (không bắt buộc)"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting || loadingOptions}>
              {submitting ? "Đang lưu..." : "Tạo lô"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInboundBatchModal;