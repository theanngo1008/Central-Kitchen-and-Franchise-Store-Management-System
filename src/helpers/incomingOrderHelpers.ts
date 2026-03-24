import {
  IncomingOrder,
  IncomingOrderItem,
} from "@/types/kitchen/incomingOrder.types";

const getRequestedQuantity = (item: IncomingOrderItem) => item.quantity || 0;
const getForwardedQuantity = (item: IncomingOrderItem) =>
  item.forwardedQuantity ?? 0;
const getDroppedQuantity = (item: IncomingOrderItem) =>
  item.droppedQuantity ?? 0;

export const isItemDroppedFromForward = (
  item: IncomingOrderItem,
): boolean => {
  if (item.isDroppedFromForward === true) return true;
  if (getDroppedQuantity(item) > 0) return true;

  // fallback tạm cho dữ liệu cũ
  return item.isDropped === true;
};

export const isItemPartiallyForwarded = (
  item: IncomingOrderItem,
): boolean => {
  const requested = getRequestedQuantity(item);
  const forwarded = getForwardedQuantity(item);

  return forwarded > 0 && forwarded < requested;
};

export const isItemFullyForwarded = (item: IncomingOrderItem): boolean => {
  const requested = getRequestedQuantity(item);
  const forwarded = getForwardedQuantity(item);

  return requested > 0 && forwarded === requested;
};

export const getPartiallyForwardedItems = (
  order: IncomingOrder,
): IncomingOrderItem[] => {
  if (!order.items?.length) return [];
  return order.items.filter(isItemPartiallyForwarded);
};

export const getDroppedItems = (order: IncomingOrder): IncomingOrderItem[] => {
  if (!order.items?.length) return [];
  return order.items.filter(isItemDroppedFromForward);
};

export const getFullyForwardedItems = (
  order: IncomingOrder,
): IncomingOrderItem[] => {
  if (!order.items?.length) return [];
  return order.items.filter(isItemFullyForwarded);
};

export const hasPartialOrDroppedItems = (order: IncomingOrder): boolean => {
  if (!order.items?.length) return false;

  return order.items.some(
    (item) => isItemDroppedFromForward(item) || isItemPartiallyForwarded(item),
  );
};

export const hasForwardSnapshotWarning = (
  order: IncomingOrder,
): boolean => {
  if (!order.items?.length) return false;

  return order.items.some(
    (item) =>
      item.hasForwardSnapshot === true &&
      item.isForwardSnapshotConsistent === false,
  );
};

export const getForwardSnapshotWarnings = (
  order: IncomingOrder,
): string[] => {
  if (!order.items?.length) return [];

  return order.items
    .map((item) => item.forwardSnapshotWarning?.trim())
    .filter((warning): warning is string => Boolean(warning));
};