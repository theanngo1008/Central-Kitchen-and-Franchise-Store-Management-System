import React from "react";

type Status =
  | "pending"
  | "processing"
  | "delivered"
  | "cancelled"
  | "scheduled"
  | "in_transit"
  | "delayed"
  | "planned"
  | "in_progress"
  | "completed"
  | "active"
  | "inactive"
  | "DRAFT"
  | "SUBMITTED"
  | "LOCKED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: "Chờ xử lý", className: "status-badge status-pending" },
  processing: { label: "Đang xử lý", className: "status-badge status-processing" },
  delivered: { label: "Đã giao", className: "status-badge status-delivered" },
  cancelled: { label: "Đã huỷ", className: "status-badge status-cancelled" },
  scheduled: { label: "Đã lên lịch", className: "status-badge status-processing" },
  in_transit: { label: "Đang giao", className: "status-badge status-processing" },
  delayed: { label: "Trễ hạn", className: "status-badge status-pending" },
  planned: { label: "Đã lên kế hoạch", className: "status-badge status-pending" },
  in_progress: { label: "Đang thực hiện", className: "status-badge status-processing" },
  completed: { label: "Hoàn thành", className: "status-badge status-delivered" },
  active: { label: "Hoạt động", className: "status-badge status-delivered" },
  inactive: { label: "Ngừng hoạt động", className: "status-badge status-cancelled" },

  DRAFT: { label: "Nháp", className: "status-badge status-pending" },
  SUBMITTED: { label: "Đã gửi", className: "status-badge status-processing" },
  LOCKED: { label: "Đã khóa", className: "status-badge status-locked" },
  CONFIRMED: { label: "Đã xác nhận", className: "status-badge status-processing" },
  IN_PROGRESS: { label: "Đang sản xuất", className: "status-badge status-processing" },
  COMPLETED: { label: "Hoàn thành", className: "status-badge status-delivered" },
  CANCELLED: { label: "Đã hủy", className: "status-badge status-cancelled" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const config = statusConfig[status];

  return <span className={`${config.className} ${className}`}>{config.label}</span>;
};