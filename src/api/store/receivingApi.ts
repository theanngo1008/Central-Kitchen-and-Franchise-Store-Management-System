import { get, post } from "@/api";
import { unwrapResponse } from "@/api/unwrapResponse";

import type {
  PendingReceivingItem,
  ReceivingDetail,
  ConfirmReceivingPayload,
} from "@/types/store/receiving.types";

const ENDPOINT = "/franchises";

export const getPendingReceivings = async (
  franchiseId: number,
): Promise<PendingReceivingItem[]> => {
  const res = await get(`${ENDPOINT}/${franchiseId}/receivings/pending`);
  return unwrapResponse<PendingReceivingItem[]>(res);
};

export const getReceivingDetail = async (
  franchiseId: number,
  deliveryId: number,
): Promise<ReceivingDetail> => {
  const res = await get(`${ENDPOINT}/${franchiseId}/receivings/${deliveryId}`);
  return unwrapResponse<ReceivingDetail>(res);
};

export const confirmReceiving = async (
  franchiseId: number,
  deliveryId: number,
  data: ConfirmReceivingPayload,
): Promise<void> => {
  const res = await post(
    `${ENDPOINT}/${franchiseId}/receivings/${deliveryId}/confirm`,
    data,
  );

  return unwrapResponse<void>(res);
};