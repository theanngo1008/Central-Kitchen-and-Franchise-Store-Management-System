import React from "react";

type Props = {
  status?: string | null;
};

const FLOW = [
  "DRAFT",
  "SUBMITTED",
  "LOCKED",
  "RECEIVED_BY_KITCHEN",
  "FORWARDED_TO_SUPPLY",
  "PREPARING",
  "READY_TO_DELIVER",
  "IN_TRANSIT",
  "DELIVERED",
  "RECEIVED_BY_STORE",
];

const LABEL_MAP: Record<string, string> = {
  DRAFT: "Tạo",
  SUBMITTED: "Gửi",
  LOCKED: "Khóa",
  RECEIVED_BY_KITCHEN: "Kitchen",
  FORWARDED_TO_SUPPLY: "Supply",
  PREPARING: "Chuẩn bị",
  READY_TO_DELIVER: "Sẵn sàng",
  IN_TRANSIT: "Đang giao",
  DELIVERED: "Đã giao",
  RECEIVED_BY_STORE: "Đã nhận",
};

const StoreOrderProgress: React.FC<Props> = ({ status }) => {
  const currentIndex = FLOW.indexOf(status || "");

  return (
    <div className="bg-card border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between overflow-x-auto">
        {FLOW.map((step, i) => {
          const completed = i < currentIndex;
          const active = i === currentIndex;

          return (
            <div key={step} className="flex items-center flex-1 min-w-[110px]">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition",
                  active
                    ? "bg-green-500 text-white shadow"
                    : completed
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400",
                ].join(" ")}
              >
                {i + 1}
              </div>

              <span
                className={[
                  "ml-2 text-sm whitespace-nowrap",
                  active
                    ? "text-green-600 font-semibold"
                    : completed
                      ? "text-foreground"
                      : "text-muted-foreground",
                ].join(" ")}
              >
                {LABEL_MAP[step]}
              </span>

              {i !== FLOW.length - 1 && (
                <div
                  className={[
                    "flex-1 h-1 mx-3 rounded transition",
                    completed ? "bg-green-300" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoreOrderProgress;