import React, { useState } from "react";
import { RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api";

import {
  usePendingReceivings,
  useReceivingDetail,
  useConfirmReceiving,
} from "@/hooks/store/useReceiving";

import type {
  ConfirmReceivingItemPayload,
  ConfirmReceivingPayload,
} from "@/types/store/receiving.types";

import ReceivingCard from "./components/ReceivingCard";
import ReceivingDetailModal from "./components/ReceivingDetailModal";
import EmptyReceivingState from "./components/EmptyReceivingState";

const ReceiveGoods: React.FC = () => {
  const user = authApi.getCurrentUser();
  const franchiseId = user?.franchiseId
    ? Number(user.franchiseId)
    : undefined;

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null
  );
  const [note, setNote] = useState("");

  const {
    data: receivings = [],
    isLoading,
    isError,
    refetch,
  } = usePendingReceivings(franchiseId ?? 0);

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useReceivingDetail(franchiseId ?? 0, selectedDeliveryId);

  const confirmMutation = useConfirmReceiving();

  const handleCloseModal = () => {
    setSelectedDeliveryId(null);
    setNote("");
  };

  const handleConfirm = () => {
    if (!selectedDeliveryId || !detail || !franchiseId) return;

    const items: ConfirmReceivingItemPayload[] = detail.items.map((item) => ({
      itemType: item.itemType,
      itemId: item.itemId,
      receivedQuantity: item.deliveredQuantity,
    }));

    const payload: ConfirmReceivingPayload = {
      note: note.trim(),
      items,
    };

    confirmMutation.mutate(
      {
        franchiseId,
        deliveryId: selectedDeliveryId,
        data: payload,
      },
      {
        onSuccess: () => {
          /**
           * CLOSE MODAL FIRST
           * Prevent detail refetch flash
           */
          handleCloseModal();
        },
      }
    );
  };

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
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">Không thể tải dữ liệu.</p>
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
      />

      {receivings.length === 0 ? (
        <EmptyReceivingState />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {receivings.map((receiving) => (
            <ReceivingCard
              key={receiving.receivingId}
              receiving={receiving}
              onOpen={() => setSelectedDeliveryId(receiving.receivingId)}
            />
          ))}
        </div>
      )}

      <ReceivingDetailModal
        open={!!selectedDeliveryId}
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