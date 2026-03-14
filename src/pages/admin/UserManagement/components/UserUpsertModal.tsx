import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { adminFranchisesApi } from "@/api/admin/franchises.api";
import { adminCentralKitchensApi } from "@/api/admin/centralKitchens.api";
import type {
  AdminFranchise,
  WorkAssignmentType,
} from "@/types/admin/franchise.types";
import type { AdminCentralKitchen } from "@/types/admin/centralKitchen.types";
import type {
  AdminUser,
  UpdateUserPayload,
  UserStatus,
} from "@/types/admin/user.types";

export interface CreateUserFormPayload {
  username: string;
  email: string;
  password: string;
  roleId: number;
  assignmentType?: WorkAssignmentType;
  workplaceId?: number | null;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: AdminUser | null;
  onCreate: (payload: CreateUserFormPayload) => void | Promise<void>;
  onUpdate: (id: number, payload: UpdateUserPayload) => void | Promise<void>;
};

const ROLE_SUPPLY_COORDINATOR = 3;
const ROLE_KITCHEN_STAFF = 4;
const ROLE_STORE_STAFF = 5;

const CREATE_ROLE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "SupplyCoordinator", value: ROLE_SUPPLY_COORDINATOR },
  { label: "KitchenStaff", value: ROLE_KITCHEN_STAFF },
  { label: "StoreStaff", value: ROLE_STORE_STAFF },
];

const resolveDefaultAssignmentType = (
  roleId: number,
): WorkAssignmentType | "" => {
  if (roleId === ROLE_STORE_STAFF) return "FRANCHISE";
  if (
    roleId === ROLE_KITCHEN_STAFF ||
    roleId === ROLE_SUPPLY_COORDINATOR
  ) {
    return "CENTRAL_KITCHEN";
  }
  return "";
};

export const UserUpsertModal: React.FC<Props> = ({
  open,
  onOpenChange,
  selectedUser,
  onCreate,
  onUpdate,
}) => {
  const isEdit = !!selectedUser;

  const normalizedRoleName = (selectedUser?.roleName || "").toLowerCase();

  const isProtectedRole =
    selectedUser?.roleId === 1 ||
    selectedUser?.roleId === 9 ||
    normalizedRoleName === "admin" ||
    normalizedRoleName === "manager";

  const roleOptions = useMemo(() => {
    if (!isEdit) return CREATE_ROLE_OPTIONS;
    if (isProtectedRole) return [];
    return CREATE_ROLE_OPTIONS;
  }, [isEdit, isProtectedRole]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(CREATE_ROLE_OPTIONS[0].value);
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  const [franchises, setFranchises] = useState<AdminFranchise[]>([]);
  const [centralKitchens, setCentralKitchens] = useState<AdminCentralKitchen[]>(
    [],
  );
  const [loadingWorkplaces, setLoadingWorkplaces] = useState(false);
  const [assignmentType, setAssignmentType] = useState<WorkAssignmentType | "">(
    "",
  );
  const [workplaceId, setWorkplaceId] = useState<number | null>(null);

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    roleId?: string;
    assignmentType?: string;
    workplaceId?: string;
  }>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});

    if (selectedUser) {
      setUsername(selectedUser.username);
      setEmail(selectedUser.email);
      setPassword("");
      setRoleId(selectedUser.roleId);
      setStatus(selectedUser.status);
      setAssignmentType("");
      setWorkplaceId(null);
    } else {
      const defaultRoleId = CREATE_ROLE_OPTIONS[0].value;
      setUsername("");
      setEmail("");
      setPassword("");
      setRoleId(defaultRoleId);
      setStatus("ACTIVE");
      setAssignmentType(resolveDefaultAssignmentType(defaultRoleId));
      setWorkplaceId(null);
    }
  }, [open, selectedUser]);

  useEffect(() => {
    if (!open || isEdit) return;

    const run = async () => {
      try {
        setLoadingWorkplaces(true);
        const [storeData, kitchenData] = await Promise.all([
          adminFranchisesApi.list(),
          adminCentralKitchensApi.list(),
        ]);
        setFranchises(storeData || []);
        setCentralKitchens(kitchenData || []);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách nơi làm việc");
      } finally {
        setLoadingWorkplaces(false);
      }
    };

    run();
  }, [open, isEdit]);

  const isSupplyCoordinator = roleId === ROLE_SUPPLY_COORDINATOR;
  const isKitchenStaff = roleId === ROLE_KITCHEN_STAFF;
  const isStoreStaff = roleId === ROLE_STORE_STAFF;

  const effectiveAssignmentType = useMemo<WorkAssignmentType | "">(() => {
    if (isStoreStaff) return "FRANCHISE";
    if (isKitchenStaff || isSupplyCoordinator) return "CENTRAL_KITCHEN";
    return assignmentType;
  }, [isStoreStaff, isKitchenStaff, isSupplyCoordinator, assignmentType]);

  const showWorkplaceSection = !isEdit;

  const storeOptions = useMemo(
    () => franchises.filter((f) => f.type === "STORE"),
    [franchises],
  );

  const kitchenOptions = useMemo(() => centralKitchens, [centralKitchens]);

  const workplaceOptions = useMemo(() => {
    if (effectiveAssignmentType === "FRANCHISE") return storeOptions;
    if (effectiveAssignmentType === "CENTRAL_KITCHEN") return kitchenOptions;
    return [];
  }, [effectiveAssignmentType, storeOptions, kitchenOptions]);

  const selectedWorkplace = useMemo(() => {
    if (effectiveAssignmentType === "FRANCHISE") {
      return (
        storeOptions.find((item) => item.franchiseId === workplaceId) || null
      );
    }

    if (effectiveAssignmentType === "CENTRAL_KITCHEN") {
      return (
        kitchenOptions.find((item) => item.centralKitchenId === workplaceId) ||
        null
      );
    }

    return null;
  }, [effectiveAssignmentType, storeOptions, kitchenOptions, workplaceId]);

  useEffect(() => {
    if (!open || isEdit) return;
    setWorkplaceId(null);
  }, [roleId, assignmentType, open, isEdit]);

  useEffect(() => {
    if (!open || isEdit) return;
    if (effectiveAssignmentType !== "CENTRAL_KITCHEN") return;
    if (workplaceId) return;
    if (kitchenOptions.length !== 1) return;

    setWorkplaceId(kitchenOptions[0].centralKitchenId);
  }, [open, isEdit, effectiveAssignmentType, workplaceId, kitchenOptions]);

  const canSubmit = useMemo(() => {
    if (isEdit) {
      return !!roleId && !!status;
    }

    const baseValid =
      username.trim().length >= 3 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      !!roleId;

    if (!baseValid) return false;
    if (!showWorkplaceSection) return true;
    if (!effectiveAssignmentType) return false;
    if (!workplaceId) return false;

    return true;
  }, [
    isEdit,
    username,
    email,
    password,
    roleId,
    status,
    showWorkplaceSection,
    effectiveAssignmentType,
    workplaceId,
  ]);

  const validateForm = () => {
    const nextErrors: {
      username?: string;
      email?: string;
      password?: string;
      roleId?: string;
      assignmentType?: string;
      workplaceId?: string;
    } = {};

    if (!isEdit) {
      if (username.trim().length < 3) {
        nextErrors.username = "Tên đăng nhập phải từ 3 ký tự trở lên";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        nextErrors.email = "Vui lòng nhập email";
      } else if (!emailRegex.test(email.trim())) {
        nextErrors.email = "Email không hợp lệ";
      }

      if (password.length < 8) {
        nextErrors.password = "Mật khẩu phải từ 8 ký tự trở lên";
      }

      if (!roleId) {
        nextErrors.roleId = "Vui lòng chọn vai trò";
      }

      if (showWorkplaceSection) {
        if (!effectiveAssignmentType) {
          nextErrors.assignmentType = "Vui lòng chọn loại nơi làm việc";
        }

        if (!workplaceId) {
          nextErrors.workplaceId = "Vui lòng chọn nơi làm việc";
        }
      }
    } else {
      if (!roleId) {
        nextErrors.roleId = "Vui lòng chọn vai trò";
      }

      if (!status) {
        nextErrors.roleId = "Vui lòng chọn trạng thái";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (selectedUser) {
      await onUpdate(selectedUser.userId, { roleId, status });
      return;
    }

    await onCreate({
      username: username.trim(),
      email: email.trim(),
      password,
      roleId,
      assignmentType: effectiveAssignmentType || undefined,
      workplaceId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEdit && (
            <>
              <div>
                <Label>Tên đăng nhập</Label>
                <Input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder="username"
                />
                {errors.username && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="******"
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
            </>
          )}

          {isEdit && (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{selectedUser?.username}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{selectedUser?.email}</span>
              </div>
            </div>
          )}

          <div>
            <Label>Vai trò</Label>

            {isEdit && isProtectedRole ? (
              <div className="h-10 px-3 rounded-md border bg-muted/30 flex items-center text-sm font-medium">
                {normalizedRoleName === "admin" || selectedUser?.roleId === 1
                  ? "Admin"
                  : "Manager"}
              </div>
            ) : (
              <>
                <Select
                  value={String(roleId)}
                  onValueChange={(v) => {
                    setRoleId(Number(v));
                    setErrors((prev) => ({
                      ...prev,
                      roleId: undefined,
                      assignmentType: undefined,
                      workplaceId: undefined,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r.value} value={String(r.value)}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.roleId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.roleId}
                  </p>
                )}
              </>
            )}
          </div>

          {!isEdit && (
            <>
              {(isSupplyCoordinator || isKitchenStaff || isStoreStaff) && (
                <div>
                  <Label>Loại nơi làm việc</Label>
                  <div className="h-10 px-3 rounded-md border bg-muted/30 flex items-center text-sm font-medium">
                    {effectiveAssignmentType === "CENTRAL_KITCHEN"
                      ? "Central Kitchen"
                      : "Franchise"}
                  </div>
                </div>
              )}

              <div>
                <Label>
                  {effectiveAssignmentType === "CENTRAL_KITCHEN"
                    ? "Chọn bếp"
                    : "Chọn cửa hàng"}
                </Label>
                <Select
                  value={workplaceId ? String(workplaceId) : ""}
                  onValueChange={(v) => {
                    setWorkplaceId(Number(v));
                    setErrors((prev) => ({ ...prev, workplaceId: undefined }));
                  }}
                  disabled={
                    loadingWorkplaces ||
                    !effectiveAssignmentType ||
                    workplaceOptions.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingWorkplaces
                          ? "Đang tải dữ liệu..."
                          : !effectiveAssignmentType
                            ? "Chọn loại nơi làm việc trước"
                            : effectiveAssignmentType === "CENTRAL_KITCHEN"
                              ? "Chọn bếp trung tâm"
                              : "Chọn cửa hàng"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveAssignmentType === "FRANCHISE" &&
                      storeOptions.map((item) => (
                        <SelectItem
                          key={item.franchiseId}
                          value={String(item.franchiseId)}
                        >
                          {item.name}
                        </SelectItem>
                      ))}

                    {effectiveAssignmentType === "CENTRAL_KITCHEN" &&
                      kitchenOptions.map((item) => (
                        <SelectItem
                          key={item.centralKitchenId}
                          value={String(item.centralKitchenId)}
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.workplaceId && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.workplaceId}
                  </p>
                )}
                {selectedWorkplace && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedWorkplace.address} • {selectedWorkplace.location}
                  </p>
                )}
              </div>
            </>
          )}

          {isEdit && (
            <div>
              <Label>Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loadingWorkplaces || !canSubmit}
            >
              {selectedUser ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};