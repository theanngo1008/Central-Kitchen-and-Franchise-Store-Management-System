import React from "react";
import { RefreshCw, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { IncomingOrdersFilter } from "../helpers";
import { INCOMING_ORDER_FILTER_OPTIONS } from "../helpers";

type Props = {
  filter: IncomingOrdersFilter;
  onFilterChange: (value: IncomingOrdersFilter) => void;
  onRefresh: () => void | Promise<void>;
  refreshing?: boolean;
  totalOrders?: number;
};

const PRIMARY_FILTERS: IncomingOrdersFilter[] = [
  "ALL",
  "SUBMITTED",
  "RECEIVED_BY_KITCHEN",
  "FORWARDED_TO_SUPPLY",
];

const MORE_FILTERS: IncomingOrdersFilter[] = [
  "PREPARING",
  "READY_TO_DELIVER",
  "IN_TRANSIT",
  "DELIVERED",
  "RECEIVED_BY_STORE",
  "CANCELLED",
  "DRAFT",
];

const IncomingOrdersToolbar: React.FC<Props> = ({
  filter,
  onFilterChange,
  onRefresh,
  refreshing = false,
  totalOrders = 0,
}) => {
  const primaryOptions = INCOMING_ORDER_FILTER_OPTIONS.filter((option) =>
    PRIMARY_FILTERS.includes(option.value),
  );

  const moreOptions = INCOMING_ORDER_FILTER_OPTIONS.filter((option) =>
    MORE_FILTERS.includes(option.value),
  );

  const activeMoreOption = moreOptions.find((option) => option.value === filter);

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Đơn hàng đến</h3>
            <p className="text-sm text-muted-foreground">
              Tìm thấy {totalOrders} đơn hàng
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex min-w-max items-center gap-2 rounded-xl border bg-muted/40 p-1">
            {primaryOptions.map((option) => {
              const isActive = option.value === filter;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFilterChange(option.value)}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    "whitespace-nowrap",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={[
                    "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    "whitespace-nowrap",
                    activeMoreOption
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {activeMoreOption ? activeMoreOption.label : "Khác"}
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                {moreOptions.map((option) => {
                  const isActive = option.value === filter;

                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => onFilterChange(option.value)}
                      className={isActive ? "font-semibold" : ""}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingOrdersToolbar;