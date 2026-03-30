import React, { useMemo, useState } from "react";
import { RefreshCw, Truck, Package, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api";

import {
  usePendingReceivings,
  useReceivingDetail,
  useConfirmReceiving,
} from "@/hooks/store/useReceiving";

import type {
  ConfirmReceivingPayload,
} from "@/types/store/receiving.types";

import ReceivingCard from "./components/ReceivingCard";
import ReceivingDetailModal from "./components/ReceivingDetailModal";
import EmptyReceivingState from "./components/EmptyReceivingState";

const ReceiveGoods: React.FC = () => {
  const user = authApi.getCurrentUser();
  const franchiseId = user?.franchiseId ? Number(user.franchiseId) : undefined;

  const [selectedReceivingId, setSelectedReceivingId] = useState<number | null>(
    null,
  );
  const [note, setNote] = useState("");

  const {
    data: receivings = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = usePendingReceivings(franchiseId ?? 0);

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useReceivingDetail(franchiseId ?? 0, selectedReceivingId);

  const confirmMutation = useConfirmReceiving();

  const handleCloseModal = () => {
    setSelectedReceivingId(null);
    setNote("");
  };

  const handleConfirm = () => {
    if (!selectedReceivingId || !detail || !franchiseId) return;

    const payload: ConfirmReceivingPayload = {
      note: note.trim(),
    };

    confirmMutation.mutate(
      {
        franchiseId,
        deliveryId: selectedReceivingId,
        data: payload,
      },
      {
        onSuccess: () => {
          handleCloseModal();
          refetch();
        },
      },
    );
  };

  const stats = useMemo(() => {
    const pending = receivings.filter((r) => r.status !== "RECEIVED_BY_STORE").length;
    const delivered = receivings.filter((r) => r.status === "DELIVERED").length;
    const received = receivings.filter((r) => r.status === "RECEIVED_BY_STORE").length;
    return { pending, delivered, received };
  }, [receivings]);

  if (!franchiseId) {
    return <div className="p-8 text-center">Không tìm thấy mã Cửa hàng.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Đang tải danh sách chờ nhận...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-destructive">Không thể tải dữ liệu.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <PageHeader
        title="Nhận hàng"
        subtitle="Kiểm tra và xác nhận các chuyến giao hàng từ Bếp Trung Tâm"
        action={{
          label: isFetching ? "Đang làm mới..." : "Làm mới",
          icon: RefreshCw,
          onClick: () => refetch(),
        }}
      />

      {/* Mini stats */}
      {receivings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Chờ xác nhận</p>
              <Package size={15} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Sẵn sàng nhận</p>
              <Truck size={15} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.delivered}</p>
          </div>

          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Đã nhận xong</p>
              <CheckCircle2 size={15} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.received}</p>
          </div>
        </div>
      )}

      {receivings.length === 0 ? (
        <EmptyReceivingState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {receivings.map((receiving) => (
            <ReceivingCard
              key={receiving.receivingId}
              receiving={receiving}
              onOpen={() => setSelectedReceivingId(receiving.receivingId)}
            />
          ))}
        </div>
      )}

      <ReceivingDetailModal
        open={!!selectedReceivingId}
        onClose={handleCloseModal}
        detail={detail}
        isLoading={isDetailLoading}
        isError={isDetailError}
        note={note}
        onNoteChange={setNote}
        onConfirm={handleConfirm}
        confirmLoading={confirmMutation.isPending}
      />
    </div>
  );
};

export default ReceiveGoods;