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

import type {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserStatus,
} from "@/types/admin/user.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: AdminUser | null;
  onCreate: (payload: CreateUserPayload) => void | Promise<void>;
  onUpdate: (id: number, payload: UpdateUserPayload) => void | Promise<void>;
};


const CREATE_ROLE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "SupplyCoordinator", value: 3 },
  { label: "KitchenStaff", value: 4 },
  { label: "StoreStaff", value: 5 },
];

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

  useEffect(() => {
    if (!open) return;

    if (selectedUser) {
      setUsername(selectedUser.username);
      setEmail(selectedUser.email);
      setPassword("");
      setRoleId(selectedUser.roleId);
      setStatus(selectedUser.status);
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRoleId(CREATE_ROLE_OPTIONS[0].value);
      setStatus("ACTIVE");
    }
  }, [open, selectedUser]);

  const canSubmit = useMemo(() => {
    if (isEdit) {
      return !!roleId && !!status;
    }
    return (
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !!roleId
    );
  }, [isEdit, username, email, password, roleId, status]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (selectedUser) {
      await onUpdate(selectedUser.userId, { roleId, status });
      return;
    }

    await onCreate({
      username: username.trim(),
      email: email.trim(),
      password,
      roleId,
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
          {/* Create-only fields */}
          {!isEdit && (
            <>
              <div>
                <Label>Tên đăng nhập</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                />
              </div>
            </>
          )}

          {/* Edit-only info (readonly) */}
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

          {/* Shared: role */}
          <div>
            <Label>Vai trò</Label>

            {isEdit && isProtectedRole ? (
              <div className="h-10 px-3 rounded-md border bg-muted/30 flex items-center text-sm font-medium">
                {normalizedRoleName === "admin" || selectedUser?.roleId === 1
                  ? "Admin"
                  : "Manager"}
              </div>
            ) : (
              <Select
                value={String(roleId)}
                onValueChange={(v) => setRoleId(Number(v))}
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
            )}
          </div>
          {/* Edit-only: status */}
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
              disabled={!canSubmit}
            >
              {selectedUser ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
