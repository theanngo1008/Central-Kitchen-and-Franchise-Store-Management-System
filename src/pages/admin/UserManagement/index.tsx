import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { UsersToolbar, UsersTable, UserUpsertModal } from "./components";
import UserFranchiseAssignModal from "./components/UserFranchiseAssignModal";

import { adminUsersApi } from "@/api/admin/users.api";
import { adminUserFranchisesApi } from "@/api/admin/userFranchises.api";
import type { WorkAssignmentType } from "@/types/admin/franchise.types";
import type {
  AdminUser,
  UpdateUserPayload,
} from "@/types/admin/user.types";
import type { CreateUserFormPayload } from "./components/UserUpsertModal";

const ROLE_LABEL: Record<number, string> = {
  1: "Admin",
  9: "Manager",
  3: "SupplyCoordinator",
  4: "KitchenStaff",
  5: "StoreStaff",
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [assignUser, setAssignUser] = useState<AdminUser | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUsersApi.list();

      const normalized = data.map((u) => ({
        ...u,
        roleName: u.roleName ?? ROLE_LABEL[u.roleId] ?? `Role#${u.roleId}`,
      }));

      setUsers(normalized);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) => {
      const roleText = (u.roleName ?? ROLE_LABEL[u.roleId] ?? "").toLowerCase();
      return (
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        roleText.includes(term)
      );
    });
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const inactive = users.filter((u) => u.status === "INACTIVE").length;
    const admins = users.filter(
      (u) => u.roleName?.toLowerCase() === "admin",
    ).length;
    return { total, active, inactive, admins };
  }, [users]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenAssign = (user: AdminUser) => {
    setAssignUser(user);
    setIsAssignOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = async (payload: CreateUserFormPayload) => {
    try {
      const createdUser = await adminUsersApi.create({
        username: payload.username,
        email: payload.email,
        password: payload.password,
        roleId: payload.roleId,
      });

      if (payload.assignmentType && payload.workplaceId) {
        const assignmentType: WorkAssignmentType = payload.assignmentType;

        await adminUserFranchisesApi.assign({
          userId: createdUser.userId,
          assignmentType,
          franchiseId:
            assignmentType === "FRANCHISE" ? payload.workplaceId : null,
          centralKitchenId:
            assignmentType === "CENTRAL_KITCHEN" ? payload.workplaceId : null,
        });

        toast.success("Đã thêm người dùng và gán nơi làm việc");
      } else {
        toast.success("Đã thêm người dùng mới");
      }

      setIsDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (e: any) {
      console.error(e);

      const data = e?.response?.data;
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Tạo người dùng thất bại";

      toast.error(message);
    }
  };

  const handleUpdate = async (id: number, payload: UpdateUserPayload) => {
    try {
      await adminUsersApi.update(id, payload);
      toast.success("Đã cập nhật người dùng");
      setIsDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await handleUpdate(user.userId, {
      roleId: user.roleId,
      status: nextStatus,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await adminUsersApi.remove(id);
      toast.success("Đã xóa người dùng");
      await loadUsers();
    } catch (e) {
      console.error(e);
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quản lý Người dùng"
        subtitle="Quản lý tài khoản và quyền truy cập hệ thống"
        action={{
          label: "Thêm người dùng",
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Tổng người dùng</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{stats.active}</p>
          <p className="text-sm text-muted-foreground">Đang hoạt động</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-muted-foreground">
            {stats.inactive}
          </p>
          <p className="text-sm text-muted-foreground">Đã khóa</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{stats.admins}</p>
          <p className="text-sm text-muted-foreground">Quản trị viên</p>
        </div>
      </div>

      <UsersToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onRefresh={loadUsers}
        loading={loading}
      />

      <UsersTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onAssignFranchises={handleOpenAssign}
      />

      <UserUpsertModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedUser={selectedUser}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <UserFranchiseAssignModal
        open={isAssignOpen}
        onOpenChange={(v) => {
          setIsAssignOpen(v);
          if (!v) setAssignUser(null);
        }}
        user={assignUser}
      />
    </div>
  );
};

export default UserManagement;