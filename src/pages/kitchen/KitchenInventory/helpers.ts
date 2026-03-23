import type {
  IngredientBatch,
  InventoryAdjustmentType,
  KitchenInventoryTab,
  ProductBatch,
} from "@/types/kitchen/inventoryBatch.types";

export type KitchenInventoryBatchRow = IngredientBatch | ProductBatch;

export const KITCHEN_INVENTORY_TAB_OPTIONS: Array<{
  label: string;
  value: KitchenInventoryTab;
}> = [
  { label: "Nguyên liệu", value: "INGREDIENT" },
  { label: "Sản phẩm", value: "PRODUCT" },
];

export const INVENTORY_ADJUSTMENT_TYPE_OPTIONS: Array<{
  label: string;
  value: InventoryAdjustmentType;
}> = [
  { label: "Điều chỉnh tồn kho", value: "ADJUST" },
  { label: "Hao hụt / hủy", value: "WASTE" },
];

export const isIngredientBatch = (
  batch: KitchenInventoryBatchRow,
): batch is IngredientBatch => {
  return "ingredientId" in batch;
};

export const isProductBatch = (
  batch: KitchenInventoryBatchRow,
): batch is ProductBatch => {
  return "productId" in batch;
};

export const getBatchItemName = (batch: KitchenInventoryBatchRow) => {
  if (isIngredientBatch(batch)) return batch.ingredientName;
  return batch.productName;
};

export const getBatchItemId = (batch: KitchenInventoryBatchRow) => {
  if (isIngredientBatch(batch)) return batch.ingredientId;
  return batch.productId;
};

export const canDeleteBatch = (quantity: number) => quantity === 0;

export const formatDate = (
  value?: string | null,
  locale: string = "vi-VN",
): string => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(locale).format(date);
};

export const formatDateTime = (
  value?: string | null,
  locale: string = "vi-VN",
): string => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const calculateDaysUntilExpiry = (
  expiredAt?: string | null,
): number | null => {
  if (!expiredAt) return null;

  const expiry = new Date(expiredAt);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const getExpiryText = (expiredAt?: string | null): string => {
  const days = calculateDaysUntilExpiry(expiredAt);

  if (days === null) return "--";
  if (days < 0) return `Đã hết hạn ${Math.abs(days)} ngày`;
  if (days === 0) return "Hết hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
};

export const getExpiryTextClassName = (expiredAt?: string | null): string => {
  const days = calculateDaysUntilExpiry(expiredAt);

  if (days === null) return "text-muted-foreground";
  if (days < 0) return "text-destructive";
  if (days <= 3) return "text-amber-600";
  return "text-muted-foreground";
};

export const filterInventoryBatches = (
  batches: KitchenInventoryBatchRow[],
  search: string,
) => {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return batches;

  return batches.filter((batch) => {
    const itemName = getBatchItemName(batch).toLowerCase();
    const batchCode = batch.batchCode.toLowerCase();
    const unit = batch.unit.toLowerCase();

    return (
      itemName.includes(keyword) ||
      batchCode.includes(keyword) ||
      unit.includes(keyword)
    );
  });
};

export const getInventorySummary = (batches: KitchenInventoryBatchRow[]) => {
  const expiringSoonCount = batches.filter((batch) => {
    const days = calculateDaysUntilExpiry(batch.expiredAt);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);

  return {
    totalBatches: batches.length,
    totalQuantity,
    expiringSoonCount,
  };
};