import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onRefresh: () => unknown;
  refreshing?: boolean;
};

const InventoryHistoryToolbar: React.FC<Props> = ({
  onRefresh,
  refreshing = false,
}) => {
  return (
    <div className="flex items-center justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => void onRefresh()}
        disabled={refreshing}
      >
        <RefreshCw
          size={16}
          className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
        />
        Làm mới
      </Button>
    </div>
  );
};

export default InventoryHistoryToolbar;