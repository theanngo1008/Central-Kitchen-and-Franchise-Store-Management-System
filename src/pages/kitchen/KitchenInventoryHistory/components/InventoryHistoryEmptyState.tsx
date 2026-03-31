import React from "react";

type Props = {
  title: string;
  description: string;
};

const InventoryHistoryEmptyState: React.FC<Props> = ({
  title,
  description,
}) => {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default InventoryHistoryEmptyState;