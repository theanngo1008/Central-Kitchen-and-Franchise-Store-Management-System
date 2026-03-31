import type {
  InventoryHistoryEventType,
  InventoryHistorySortDir,
} from "@/types/kitchen/inventoryHistory.types";

export const INVENTORY_HISTORY_ITEM_TYPE_OPTIONS = [
  { label: "Nguyên liệu", value: "INGREDIENT" },
  { label: "Sản phẩm", value: "PRODUCT" },
] as const;

export const INVENTORY_HISTORY_SORT_OPTIONS: Array<{
  label: string;
  value: InventoryHistorySortDir;
}> = [
  { label: "Mới nhất trước", value: "desc" },
  { label: "Cũ nhất trước", value: "asc" },
];

export const INVENTORY_HISTORY_EVENT_OPTIONS: Array<{
  label: string;
  value: InventoryHistoryEventType;
}> = [
  { label: "Nhập lô", value: "Inbound" },
  { label: "Điều chỉnh", value: "Adjust" },
  { label: "Hao hụt / hủy", value: "Waste" },
  { label: "Xuất cho sản xuất", value: "IssueProd" },
  { label: "Chuẩn bị xuất", value: "PrepareOut" },
  { label: "Vào transit", value: "TransitIn" },
  { label: "Ra khỏi transit", value: "TransitOut" },
  { label: "Nhập vào tồn kho", value: "ReceiveIn" },
  { label: "Đổi mã lô", value: "Rename" },
  { label: "Lưu trữ / xóa row hiện tại", value: "Archive" },
  { label: "Hoàn tác", value: "Reverse" },
];

export const INVENTORY_HISTORY_DEFAULT_PAGE_SIZE = 20;