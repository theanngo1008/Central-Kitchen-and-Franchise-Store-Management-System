import type {
  AdminFranchise,
  FranchiseStatus,
} from "@/types/admin/franchise.types";

export type FranchiseFormErrors = {
  centralKitchenId?: string;
  name?: string;
  status?: string;
  address?: string;
  location?: string;
};

export type ValidateFranchiseFormInput = {
  centralKitchenId: number;
  name: string;
  status: FranchiseStatus;
  address: string;
  location: string;
};

export const normalizeText = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const normalizeFranchiseName = (value: string) =>
  normalizeText(value).toLowerCase();

export const isDuplicateFranchiseName = ({
  name,
  franchises,
  currentFranchiseId,
}: {
  name: string;
  franchises: AdminFranchise[];
  currentFranchiseId?: number | null;
}) => {
  const normalizedInputName = normalizeFranchiseName(name);

  if (!normalizedInputName) return false;

  return franchises.some((franchise) => {
    const normalizedFranchiseName = normalizeFranchiseName(franchise.name || "");
    const isSameFranchise =
      currentFranchiseId != null &&
      franchise.franchiseId === currentFranchiseId;

    if (isSameFranchise) return false;

    return normalizedFranchiseName === normalizedInputName;
  });
};

export const validateFranchiseForm = (
  data: ValidateFranchiseFormInput,
): FranchiseFormErrors => {
  const errors: FranchiseFormErrors = {};

  const normalizedName = normalizeText(data.name);
  const normalizedAddress = normalizeText(data.address);
  const normalizedLocation = normalizeText(data.location);

  if (!data.centralKitchenId || data.centralKitchenId <= 0) {
    errors.centralKitchenId = "Không được để trống";
  }

  if (!normalizedName) {
    errors.name = "Không được để trống";
  } else if (normalizedName.length < 3) {
    errors.name = "Tên cửa hàng phải có ít nhất 3 ký tự";
  } else if (normalizedName.length > 100) {
    errors.name = "Tên cửa hàng không được vượt quá 100 ký tự";
  }

  if (!["ACTIVE", "INACTIVE"].includes(data.status)) {
    errors.status = "Trạng thái không hợp lệ";
  }

  if (!normalizedAddress) {
    errors.address = "Không được để trống";
  } else if (normalizedAddress.length < 5) {
    errors.address = "Địa chỉ phải có ít nhất 5 ký tự";
  } else if (normalizedAddress.length > 255) {
    errors.address = "Địa chỉ không được vượt quá 255 ký tự";
  }

  if (!normalizedLocation) {
    errors.location = "Không được để trống";
  } else if (normalizedLocation.length < 2) {
    errors.location = "Khu vực phải có ít nhất 2 ký tự";
  } else if (normalizedLocation.length > 100) {
    errors.location = "Khu vực không được vượt quá 100 ký tự";
  }

  return errors;
};

export const validateFranchiseField = (
  field: keyof ValidateFranchiseFormInput,
  data: ValidateFranchiseFormInput,
): string | undefined => {
  const errors = validateFranchiseForm(data);
  return errors[field];
};