import type {
  IncomingOrder,
  IncomingOrderItem,
  IncomingOrderStatus,
} from "@/types/kitchen/incomingOrder.types";

export type IncomingOrdersFilter = "ALL" | IncomingOrderStatus;

export const INCOMING_ORDER_DEFAULT_FILTER: IncomingOrdersFilter = "SUBMITTED";

export const INCOMING_ORDER_FILTER_OPTIONS: Array<{
  label: string;
  value: IncomingOrdersFilter;
}> = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đã gửi", value: "SUBMITTED" },
  { label: "Bếp đã tiếp nhận", value: "RECEIVED_BY_KITCHEN" },
  { label: "Đã chuyển Cung ứng", value: "FORWARDED_TO_SUPPLY" },
  { label: "Đang chuẩn bị", value: "PREPARING" },
  { label: "Sẵn sàng giao", value: "READY_TO_DELIVER" },
  { label: "Đang giao", value: "IN_TRANSIT" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Cửa hàng đã nhận", value: "RECEIVED_BY_STORE" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Nháp", value: "DRAFT" },
];

export const getIncomingOrders = (
  orders: IncomingOrder[],
  filter: IncomingOrdersFilter = INCOMING_ORDER_DEFAULT_FILTER,
): IncomingOrder[] => {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  if (filter === "ALL") {
    return [...orders];
  }

  return orders.filter((order) => order.status === filter);
};

export const getOrderItemCount = (order: IncomingOrder): number => {
  return order.items?.length ?? 0;
};

export const getOrderTotalQuantity = (order: IncomingOrder): number => {
  if (!order.items?.length) return 0;

  return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
};

export const canLockIncomingOrder = (_order: IncomingOrder): boolean => {
  return false;
};

export const canProcessIncomingOrder = (order: IncomingOrder): boolean => {
  return order.status === "SUBMITTED";
};

export const canForwardIncomingOrderStatus = (order: IncomingOrder): boolean => {
  return order.status === "RECEIVED_BY_KITCHEN";
};

export const hasIncomingOrderInventoryCheckData = (
  order: IncomingOrder,
): boolean => {
  if (!order.items?.length) return false;

  return order.items.some(
    (item) =>
      typeof item.isSufficientInCentralKitchen === "boolean" ||
      typeof item.availableInCentralKitchenQuantity === "number",
  );
};

export const isIncomingOrderItemSufficient = (
  item: IncomingOrderItem,
): boolean => {
  if (typeof item.isSufficientInCentralKitchen === "boolean") {
    return item.isSufficientInCentralKitchen;
  }

  if (typeof item.availableInCentralKitchenQuantity === "number") {
    return item.availableInCentralKitchenQuantity >= (item.quantity || 0);
  }

  return true;
};

export const hasSufficientCentralKitchenStock = (
  order: IncomingOrder,
): boolean => {
  if (!order.items?.length) return true;
  if (!hasIncomingOrderInventoryCheckData(order)) return true;

  return order.items.every(isIncomingOrderItemSufficient);
};

export const getInsufficientStockItems = (
  order: IncomingOrder,
): IncomingOrderItem[] => {
  if (!order.items?.length) return [];

  return order.items.filter((item) => !isIncomingOrderItemSufficient(item));
};

export const canForwardIncomingOrder = (order: IncomingOrder): boolean => {
  return canForwardIncomingOrderStatus(order);
};

export const hasOrderBeenSubmitted = (order: IncomingOrder): boolean => {
  return order.status === "SUBMITTED" || !!order.submittedAt;
};

export const hasOrderBeenLocked = (order: IncomingOrder): boolean => {
  return order.status === "LOCKED" || !!order.lockedAt;
};

export const hasOrderBeenReceivedByKitchen = (
  order: IncomingOrder,
): boolean => {
  return order.status === "RECEIVED_BY_KITCHEN" || !!order.receivedAt;
};

export const hasOrderBeenForwardedToSupply = (
  order: IncomingOrder,
): boolean => {
  return order.status === "FORWARDED_TO_SUPPLY" || !!order.forwardedAt;
};

export const hasOrderBeenCancelled = (order: IncomingOrder): boolean => {
  return order.status === "CANCELLED" || !!order.cancelledAt;
};

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

export const getOrderTimeline = (order: IncomingOrder) => {
  return [
    {
      key: "created",
      label: "Tạo đơn",
      value: order.createdAt,
      visible: !!order.createdAt,
    },
    {
      key: "submitted",
      label: "Đã gửi đơn",
      value: order.submittedAt ?? null,
      visible: !!order.submittedAt,
    },
    {
      key: "locked",
      label: "Đã khóa",
      value: order.lockedAt ?? null,
      visible: !!order.lockedAt || order.status === "LOCKED",
    },
    {
      key: "receivedByKitchen",
      label: "Bếp đã tiếp nhận",
      value: order.receivedAt ?? null,
      visible: !!order.receivedAt || order.status === "RECEIVED_BY_KITCHEN",
    },
    {
      key: "forwardedToSupply",
      label: "Đã chuyển Cung ứng",
      value: order.forwardedAt ?? null,
      visible: !!order.forwardedAt || order.status === "FORWARDED_TO_SUPPLY",
    },
    {
      key: "cancelled",
      label: "Đã hủy",
      value: order.cancelledAt ?? null,
      visible: !!order.cancelledAt || order.status === "CANCELLED",
    },
  ].filter((item) => item.visible);
};

export const getIncomingOrdersSummary = (orders: IncomingOrder[]) => {
  const submittedOrders = orders.filter(
    (order) => order.status === "SUBMITTED",
  );
  const lockedOrders = orders.filter((order) => order.status === "LOCKED");
  const receivedByKitchenOrders = orders.filter(
    (order) => order.status === "RECEIVED_BY_KITCHEN",
  );
  const forwardedToSupplyOrders = orders.filter(
    (order) => order.status === "FORWARDED_TO_SUPPLY",
  );
  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  );
  const draftOrders = orders.filter((order) => order.status === "DRAFT");

  return {
    totalOrders: orders.length,
    submittedOrders: submittedOrders.length,
    lockedOrders: lockedOrders.length,
    receivedByKitchenOrders: receivedByKitchenOrders.length,
    forwardedToSupplyOrders: forwardedToSupplyOrders.length,
    cancelledOrders: cancelledOrders.length,
    draftOrders: draftOrders.length,
    totalItems: orders.reduce(
      (total, order) => total + getOrderItemCount(order),
      0,
    ),
    totalQuantity: orders.reduce(
      (total, order) => total + getOrderTotalQuantity(order),
      0,
    ),
  };
};

export const sortOrdersByNewest = (
  orders: IncomingOrder[],
): IncomingOrder[] => {
  return [...orders].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();

    return bTime - aTime;
  });
};

export const getOrderDisplayCode = (order: IncomingOrder): string => {
  return `SO-${String(order.storeOrderId).padStart(6, "0")}`;
};