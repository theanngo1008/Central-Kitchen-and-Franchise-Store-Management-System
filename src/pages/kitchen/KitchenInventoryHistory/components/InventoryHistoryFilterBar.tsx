import React from "react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVENTORY_HISTORY_EVENT_OPTIONS,
  INVENTORY_HISTORY_ITEM_TYPE_OPTIONS,
  INVENTORY_HISTORY_SORT_OPTIONS,
} from "../constants";
import type {
  InventoryHistoryEventType,
  InventoryHistoryItemType,
  InventoryHistorySortDir,
} from "@/types/kitchen/inventoryHistory.types";

type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  itemType: string;
  onItemTypeChange: (value: string) => void;
  itemId: string;
  onItemIdChange: (value: string) => void;
  itemOptions: FilterOption[];
  batchId: string;
  onBatchIdChange: (value: string) => void;
  deliveryId: string;
  onDeliveryIdChange: (value: string) => void;
  eventType: string;
  onEventTypeChange: (value: string) => void;
  sortDir: InventoryHistorySortDir;
  onSortDirChange: (value: InventoryHistorySortDir) => void;
  fromUtc: string;
  onFromUtcChange: (value: string) => void;
  toUtc: string;
  onToUtcChange: (value: string) => void;
  onReset: () => void;
};

const InventoryHistoryFilterBar: React.FC<Props> = ({
  itemType,
  onItemTypeChange,
  itemId,
  onItemIdChange,
  itemOptions,
  batchId,
  onBatchIdChange,
  deliveryId,
  onDeliveryIdChange,
  eventType,
  onEventTypeChange,
  sortDir,
  onSortDirChange,
  fromUtc,
  onFromUtcChange,
  toUtc,
  onToUtcChange,
  onReset,
}) => {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select value={itemType} onValueChange={onItemTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Loại mặt hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            {INVENTORY_HISTORY_ITEM_TYPE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value as InventoryHistoryItemType}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={itemId} onValueChange={onItemIdChange}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo mặt hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả mặt hàng</SelectItem>
            {itemOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={batchId}
          onChange={(e) => onBatchIdChange(e.target.value)}
          placeholder="Batch ID"
          inputMode="numeric"
        />

        <Input
          value={deliveryId}
          onChange={(e) => onDeliveryIdChange(e.target.value)}
          placeholder="Delivery ID"
          inputMode="numeric"
        />

        <Select value={eventType} onValueChange={onEventTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Loại sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả sự kiện</SelectItem>
            {INVENTORY_HISTORY_EVENT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value as InventoryHistoryEventType}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortDir}
          onValueChange={(value) =>
            onSortDirChange(value as InventoryHistorySortDir)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Thứ tự thời gian" />
          </SelectTrigger>
          <SelectContent>
            {INVENTORY_HISTORY_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="datetime-local"
          value={fromUtc}
          onChange={(e) => onFromUtcChange(e.target.value)}
          placeholder="Từ thời điểm"
        />

        <Input
          type="datetime-local"
          value={toUtc}
          onChange={(e) => onToUtcChange(e.target.value)}
          placeholder="Đến thời điểm"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          <SearchX size={16} className="mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
};

export default InventoryHistoryFilterBar;