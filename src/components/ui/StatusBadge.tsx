import React from "react";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  DRAFT: {
    label: "Nháp",
    className: "bg-slate-100 text-slate-800",
  },
  SUBMITTED: {
    label: "Đã gửi",
    className: "bg-blue-100 text-blue-800",
  },
  LOCKED: {
    label: "Đã khóa",
    className: "bg-amber-100 text-amber-800",
  },
  RECEIVED_BY_KITCHEN: {
    label: "Kitchen đã nhận",
    className: "bg-violet-100 text-violet-800",
  },
  FORWARDED_TO_SUPPLY: {
    label: "Đã chuyển Supply",
    className: "bg-cyan-100 text-cyan-800",
  },
  PENDING: {
    label: "Chờ xác nhận",
    className: "bg-yellow-100 text-yellow-800",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    className: "bg-orange-100 text-orange-800",
  },
  READY_TO_DELIVER: {
    label: "Sẵn sàng giao",
    className: "bg-indigo-100 text-indigo-800",
  },
  IN_TRANSIT: {
    label: "Đang giao",
    className: "bg-sky-100 text-sky-800",
  },
  DELIVERED: {
    label: "Đã giao",
    className: "bg-emerald-100 text-emerald-800",
  },
  RECEIVED_BY_STORE: {
    label: "Store đã nhận",
    className: "bg-green-100 text-green-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-800",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  if (!status) {
    return (
      <span className={`bg-gray-100 text-gray-800 px-2 py-1 rounded ${className}`}>
        --
      </span>
    );
  }

  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;