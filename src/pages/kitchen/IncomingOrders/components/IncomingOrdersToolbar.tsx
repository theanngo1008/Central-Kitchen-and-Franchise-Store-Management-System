import React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  "LOCKED",
  "RECEIVED_BY_KITCHEN",
  "FORWARDED_TO_SUPPLY",
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

  const secondaryOptions = INCOMING_ORDER_FILTER_OPTIONS.filter(
    (option) => !PRIMARY_FILTERS.includes(option.value),
  );

  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Incoming Orders</h3>
          <p className="text-sm text-muted-foreground">
            {totalOrders} order{totalOrders === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            {primaryOptions.map((option) => {
              const isActive = option.value === filter;

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => onFilterChange(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-wrap gap-2">
              {secondaryOptions.map((option) => {
                const isActive = option.value === filter;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => onFilterChange(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
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
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingOrdersToolbar;