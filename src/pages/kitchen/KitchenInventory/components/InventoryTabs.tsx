import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KitchenInventoryTab } from "@/types/kitchen/inventoryBatch.types";
import { KITCHEN_INVENTORY_TAB_OPTIONS } from "../helpers";

type Props = {
  value: KitchenInventoryTab;
  onChange: (value: KitchenInventoryTab) => void;
};

const InventoryTabs: React.FC<Props> = ({ value, onChange }) => {
  return (
    <TabsList className="mb-4">
      {KITCHEN_INVENTORY_TAB_OPTIONS.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default InventoryTabs;