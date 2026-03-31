import React from "react";
import type { KitchenInventoryHistoryMovement } from "@/types/kitchen/inventoryHistory.types";
import {
  formatDateTime,
  formatDeltaQuantity,
  getDeltaTextClassName,
  getEventLabel,
  sortTimelineOldestFirst,
} from "../helpers";

type Props = {
  timeline: KitchenInventoryHistoryMovement[];
};

const BatchLifecycleTimeline: React.FC<Props> = ({ timeline }) => {
  const orderedTimeline = sortTimelineOldestFirst(timeline);

  if (orderedTimeline.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Chưa có dữ liệu timeline cho batch này.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderedTimeline.map((item) => (
        <div
          key={item.inventoryLedgerEntryId}
          className="rounded-lg border bg-background p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="font-medium">{getEventLabel(item.eventType)}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(item.occurredAtUtc)}
              </p>
              <p className="text-sm text-muted-foreground">
                Bucket: {item.stockBucket}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className={`font-medium ${getDeltaTextClassName(item)}`}>
                {formatDeltaQuantity(item)}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.actorDisplay || "--"}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Lý do / diễn giải</p>
              <p>{item.reason || "--"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Delivery / Order</p>
              <p>{item.deliveryCode || item.orderCode || "--"}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Requested / Actual / Dropped</p>
              <p>
                {item.requestedQuantitySnapshot ?? "--"} /{" "}
                {item.actualQuantitySnapshot ?? "--"} /{" "}
                {item.droppedQuantitySnapshot ?? "--"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Counterparty batch</p>
              <p>{item.counterpartyBatchId ?? "--"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BatchLifecycleTimeline;