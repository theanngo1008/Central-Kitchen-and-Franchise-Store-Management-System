import {
  IncomingOrder,
  IncomingOrderItem,
} from "@/types/kitchen/incomingOrder.types";

const getRequestedQuantity = (item: any) => item.quantity || 0;
const getForwardedQuantity = (item: any) =>
  item.forwardedQuantity ?? 0;
const getDroppedQuantity = (item: any) =>
  item.droppedQuantity ?? 0;

export const isItemDroppedFromForward = (
  item: IncomingOrderItem,
): boolean => {
  const forwarded = getForwardedQuantity(item);
  if (item.isDroppedFromForward === true && forwarded === 0) return true;
  if (getDroppedQuantity(item) > 0 && forwarded === 0) return true;

  // fallback tạm cho dữ liệu cũ - chỉ drop nếu k giao dc gì
  return item.isDropped === true && forwarded === 0;
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

const getAllItems = (order: IncomingOrder): IncomingOrderItem[] => {
  const items = order.items ?? [];
  const ingredients = (order.ingredientItems ?? []) as any as IncomingOrderItem[];
  return [...items, ...ingredients];
};

export const getPartiallyForwardedItems = (
  order: IncomingOrder,
): IncomingOrderItem[] => {
  const items = getAllItems(order);
  return items.filter(isItemPartiallyForwarded);
};

export const getDroppedItems = (order: IncomingOrder): IncomingOrderItem[] => {
  const items = getAllItems(order);
  return items.filter(isItemDroppedFromForward);
};

export const getFullyForwardedItems = (
  order: IncomingOrder,
): IncomingOrderItem[] => {
  const items = getAllItems(order);
  return items.filter(isItemFullyForwarded);
};

export const hasPartialOrDroppedItems = (order: IncomingOrder): boolean => {
  const items = getAllItems(order);

  return items.some(
    (item) => isItemDroppedFromForward(item) || isItemPartiallyForwarded(item),
  );
};

export const hasForwardSnapshotWarning = (
  order: IncomingOrder,
): boolean => {
  const items = getAllItems(order);

  return items.some(
    (item) =>
      item.hasForwardSnapshot === true &&
      item.isForwardSnapshotConsistent === false,
  );
};

export const getForwardSnapshotWarnings = (
  order: IncomingOrder,
): string[] => {
  const items = getAllItems(order);

  return items
    .map((item) => item.forwardSnapshotWarning?.trim())
    .filter((warning): warning is string => Boolean(warning));
};