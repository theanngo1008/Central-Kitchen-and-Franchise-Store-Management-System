import type { WorkAssignmentType } from "@/types/admin/franchise.types";
import type { UserStatus } from "@/types/admin/user.types";

export type UserFormErrors = {
  username?: string;
  email?: string;
  password?: string;
  roleId?: string;
  status?: string;
  assignmentType?: string;
  workplaceId?: string;
};

export type ValidateUserFormInput = {
  isEdit: boolean;
  username: string;
  email: string;
  password: string;
  roleId: number;
  status: UserStatus;
  showWorkplaceSection: boolean;
  effectiveAssignmentType: WorkAssignmentType | "";
  workplaceId: number | null;
};

export const normalizeText = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validateUserForm = (
  data: ValidateUserFormInput,
): UserFormErrors => {
  const errors: UserFormErrors = {};

  if (!data.isEdit) {
    const normalizedUsername = normalizeText(data.username);
    const normalizedEmailValue = normalizeEmail(data.email);

    if (!normalizedUsername) {
      errors.username = "Không được để trống";
    } else if (normalizedUsername.length < 3) {
      errors.username = "Tên đăng nhập phải từ 3 ký tự trở lên";
    } else if (normalizedUsername.length > 50) {
      errors.username = "Tên đăng nhập không được vượt quá 50 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmailValue) {
      errors.email = "Không được để trống";
    } else if (!emailRegex.test(normalizedEmailValue)) {
      errors.email = "Email không hợp lệ";
    }

    if (!data.password) {
      errors.password = "Không được để trống";
    } else if (data.password.length < 8) {
      errors.password = "Mật khẩu phải từ 8 ký tự trở lên";
    } else if (data.password.length > 100) {
      errors.password = "Mật khẩu không được vượt quá 100 ký tự";
    }

    if (!data.roleId) {
      errors.roleId = "Vui lòng chọn vai trò";
    }

    if (data.showWorkplaceSection) {
      if (!data.effectiveAssignmentType) {
        errors.assignmentType = "Vui lòng chọn loại nơi làm việc";
      }

      if (!data.workplaceId) {
        errors.workplaceId = "Vui lòng chọn nơi làm việc";
      }
    }
  } else {
    if (!data.roleId) {
      errors.roleId = "Vui lòng chọn vai trò";
    }

    if (!["ACTIVE", "INACTIVE"].includes(data.status)) {
      errors.status = "Trạng thái không hợp lệ";
    }
  }

  return errors;
};

export const validateUserField = (
  field:
    | "username"
    | "email"
    | "password"
    | "roleId"
    | "status"
    | "assignmentType"
    | "workplaceId",
  data: ValidateUserFormInput,
): string | undefined => {
  const errors = validateUserForm(data);
  return errors[field];
};