import type {
  InventoryHistoryEventType,
  KitchenInventoryBatchLifecycle,
  KitchenInventoryHistoryMovement,
} from "@/types/kitchen/inventoryHistory.types";

export const formatDate = (
  value?: string | null,
  locale: string = "vi-VN",
): string => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (
  value?: string | null,
  locale: string = "vi-VN",
): string => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const getEventLabel = (eventType: InventoryHistoryEventType): string => {
  const map: Record<InventoryHistoryEventType, string> = {
    Inbound: "Nhập lô",
    Adjust: "Điều chỉnh",
    Waste: "Hao hụt / hủy",
    IssueProd: "Xuất cho sản xuất",
    PrepareOut: "Chuẩn bị xuất",
    TransitIn: "Vào transit",
    TransitOut: "Ra khỏi transit",
    ReceiveIn: "Nhập vào tồn kho",
    Rename: "Đổi mã lô",
    Archive: "Lưu trữ / xóa row hiện tại",
    Reverse: "Hoàn tác",
  };

  return map[eventType] ?? eventType;
};

export const getDeltaTextClassName = (
  movement: KitchenInventoryHistoryMovement,
): string => {
  if (movement.isNonStockEvent || movement.deltaQuantity === 0) {
    return "text-muted-foreground";
  }

  if (movement.deltaQuantity > 0) return "text-emerald-600";
  return "text-destructive";
};

export const formatDeltaQuantity = (
  movement: KitchenInventoryHistoryMovement,
): string => {
  if (movement.deltaQuantity > 0) {
    return `+${movement.deltaQuantity} ${movement.itemUnit}`;
  }

  if (movement.deltaQuantity < 0) {
    return `${movement.deltaQuantity} ${movement.itemUnit}`;
  }

  return `0 ${movement.itemUnit}`;
};

export const sortTimelineOldestFirst = (
  timeline: KitchenInventoryHistoryMovement[],
) => {
  return [...timeline].sort((a, b) => {
    const aTime = new Date(a.occurredAtUtc).getTime();
    const bTime = new Date(b.occurredAtUtc).getTime();

    if (aTime !== bTime) return aTime - bTime;
    if (a.correlationId !== b.correlationId) {
      return a.correlationId.localeCompare(b.correlationId);
    }
    if (a.sequenceNo !== b.sequenceNo) return a.sequenceNo - b.sequenceNo;
    return a.inventoryLedgerEntryId - b.inventoryLedgerEntryId;
  });
};

export const getLifecycleCurrentStateText = (
  lifecycle: KitchenInventoryBatchLifecycle,
) => {
  if (!lifecycle.currentBatchExists) {
    return "Batch current-state không còn tồn tại, nhưng lịch sử vẫn được lưu.";
  }

  if (lifecycle.currentBucket === "TRANSIT") {
    return "Batch hiện đang ở transit.";
  }

  if (lifecycle.currentBucket === "ON_HAND") {
    return "Batch hiện đang ở tồn khả dụng.";
  }

  return "Đang có current-state cho batch.";
};