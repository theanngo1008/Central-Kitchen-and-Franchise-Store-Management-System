import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Building2,
  Store,
  CookingPot,
  Shield,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/types/admin/user.types";
import type { AdminFranchise } from "@/types/admin/franchise.types";
import type { AdminCentralKitchen } from "@/types/admin/centralKitchen.types";
import { useUserFranchises } from "@/hooks/admin/useUserFranchises";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
};

type WorkplaceItem =
  | (AdminFranchise & { workplaceType: "FRANCHISE" })
  | (AdminCentralKitchen & { workplaceType: "CENTRAL_KITCHEN" });

const isGlobalRole = (roleName?: string) => {
  const normalized = (roleName || "").toLowerCase();
  return normalized === "admin" || normalized === "manager";
};

const typeBadge = (type: "STORE" | "CENTRAL_KITCHEN") => {
  if (type === "STORE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
        <Store size={12} />
        STORE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
      <CookingPot size={12} />
      CENTRAL_KITCHEN
    </span>
  );
};

export const UserFranchiseAssignModal: React.FC<Props> = ({
  open,
  onOpenChange,
  user,
}) => {
  const [q, setQ] = useState("");

  const {
    franchises,
    filteredFranchises,
    centralKitchens,
    filteredCentralKitchens,
    selectedFranchiseId,
    setSelectedFranchiseId,
    initialFranchiseId,
    isKitchenBasedRole,
    isStoreBasedRole,
    getFranchiseId,
    getCentralKitchenId,
    isAllowedFranchise,
    isAllowedCentralKitchen,
    loading,
    submitting,
    removing,
    submit,
    removeAssignment,
    currentAssignment,
  } = useUserFranchises(user, open);

  const isGlobal = isGlobalRole(user?.roleName);

  const workplaceList = useMemo<WorkplaceItem[]>(() => {
    if (isStoreBasedRole) {
      return (filteredFranchises || []).map((f) => ({
        ...f,
        workplaceType: "FRANCHISE" as const,
      }));
    }

    if (isKitchenBasedRole) {
      return (filteredCentralKitchens || []).map((k) => ({
        ...k,
        workplaceType: "CENTRAL_KITCHEN" as const,
      }));
    }

    return [];
  }, [
    filteredFranchises,
    filteredCentralKitchens,
    isStoreBasedRole,
    isKitchenBasedRole,
  ]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return workplaceList;

    return workplaceList.filter((item) => {
      const hay = `${item.name} ${item.address} ${item.location}`.toLowerCase();
      return hay.includes(term);
    });
  }, [workplaceList, q]);

  const selectedWorkplace = useMemo(() => {
    if (isStoreBasedRole) {
      return (
        (franchises || []).find((f) => f.franchiseId === selectedFranchiseId) ||
        null
      );
    }

    if (isKitchenBasedRole) {
      return (
        (centralKitchens || []).find(
          (k) => k.centralKitchenId === selectedFranchiseId,
        ) || null
      );
    }

    return null;
  }, [
    franchises,
    centralKitchens,
    selectedFranchiseId,
    isStoreBasedRole,
    isKitchenBasedRole,
  ]);

  const currentAssignedLabel = useMemo(() => {
    if (isGlobal) return "Không áp dụng cho role global";
    if (!currentAssignment) return "Chưa có nơi làm việc được gán";

    if (currentAssignment.assignmentType === "CENTRAL_KITCHEN") {
      const matched = (centralKitchens || []).find(
        (k) => k.centralKitchenId === currentAssignment.centralKitchenId,
      );
      return matched
        ? `${matched.name} (CENTRAL_KITCHEN)`
        : `ID: ${currentAssignment.centralKitchenId ?? "-"}`;
    }

    const matched = (franchises || []).find(
      (f) => f.franchiseId === currentAssignment.franchiseId,
    );
    return matched
      ? `${matched.name} (STORE)`
      : `ID: ${currentAssignment.franchiseId ?? "-"}`;
  }, [currentAssignment, franchises, centralKitchens, isGlobal]);

  const close = () => onOpenChange(false);

  const handleSave = async () => {
    if (isGlobal) {
      toast.info("Role này không cần workplace assignment");
      return;
    }

    try {
      await submit();
      toast.success("Đã cập nhật gán cửa hàng / bếp");
      close();
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật thất bại");
    }
  };

  const handleRemove = async () => {
    if (isGlobal) {
      toast.info("Role này không có workplace assignment để gỡ");
      return;
    }

    try {
      await removeAssignment();
      toast.success("Đã gỡ gán cửa hàng / bếp");
    } catch (e: any) {
      toast.error(e?.message || "Gỡ gán thất bại");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div className="absolute left-1/2 top-1/2 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="text-primary" size={18} />
            </div>
            <div>
              <p className="font-semibold leading-tight">Gán cửa hàng / bếp</p>
              <p className="text-sm text-muted-foreground">
                {isGlobal
                  ? "Role này không cần workplace assignment."
                  : "Mỗi user chỉ có 1 nơi làm việc hiện tại"}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={close}>
            <X size={18} />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-muted/30 border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Người dùng</p>
              <p className="font-medium">{user?.username || "-"}</p>
              <p className="text-xs text-muted-foreground">
                ID: {user?.userId ?? "-"}
              </p>
            </div>

            <div className="bg-muted/30 border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium break-all">{user?.email || "-"}</p>
            </div>

            <div className="bg-muted/30 border rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Vai trò</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                <Shield size={12} />
                {user?.roleName || "-"}
              </span>
              {isGlobal && (
                <p className="text-xs mt-2 text-destructive">
                  Role này hoạt động theo global scope, không cần gán cửa hàng /
                  bếp.
                </p>
              )}
            </div>
          </div>

          <div className="bg-muted/30 border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Nơi làm việc hiện tại
            </p>
            <p className="font-medium">{currentAssignedLabel}</p>
            {!!initialFranchiseId && !isGlobal && (
              <p className="text-xs text-muted-foreground mt-1">
                Đã gán trước đó.
              </p>
            )}
          </div>

          {isGlobal && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-sm font-medium text-primary">Global role</p>
              <p className="text-sm text-muted-foreground mt-1">
                User có role này được mở scope theo role, không phụ thuộc
                franchiseId hoặc centralKitchenId.
              </p>
            </div>
          )}

          {!isGlobal && (
            <>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm theo tên / địa chỉ / location..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={loading}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setQ("")}
                  disabled={!q || loading}
                >
                  Xóa
                </Button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between">
                  <p className="text-sm font-medium">Danh sách cửa hàng / bếp</p>
                  <p className="text-xs text-muted-foreground">
                    Đang chọn:{" "}
                    <span className="font-medium">
                      {selectedWorkplace ? selectedWorkplace.name : "Chưa chọn"}
                    </span>
                  </p>
                </div>

                {loading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Đang tải dữ liệu...
                  </div>
                ) : list.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Không có cửa hàng / bếp phù hợp.
                  </div>
                ) : (
                  <div className="max-h-[380px] overflow-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-background">
                          <th className="text-left p-3 w-12"></th>
                          <th className="text-left p-3 font-medium">Tên</th>
                          <th className="text-left p-3 font-medium">Loại</th>
                          <th className="text-left p-3 font-medium">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((item) => {
                          const itemId =
                            item.workplaceType === "CENTRAL_KITCHEN"
                              ? getCentralKitchenId(item)
                              : getFranchiseId(item);

                          const checked = selectedFranchiseId === itemId;
                          const allowed =
                            item.workplaceType === "CENTRAL_KITCHEN"
                              ? isAllowedCentralKitchen(item)
                              : isAllowedFranchise(item);

                          return (
                            <tr
                              key={`${item.workplaceType}-${itemId}`}
                              className={`border-b last:border-0 hover:bg-muted/20 ${
                                !allowed ? "opacity-60" : ""
                              }`}
                            >
                              <td className="p-3">
                                <input
                                  type="radio"
                                  name="user-work-assignment"
                                  checked={checked}
                                  disabled={!allowed}
                                  onChange={() => setSelectedFranchiseId(itemId)}
                                  className="h-4 w-4"
                                />
                              </td>

                              <td className="p-3">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.address} • {item.location}
                                </p>
                              </td>

                              <td className="p-3">
                                {typeBadge(
                                  item.workplaceType === "CENTRAL_KITCHEN"
                                    ? "CENTRAL_KITCHEN"
                                    : "STORE",
                                )}
                              </td>

                              <td className="p-3">
                                {item.status === "ACTIVE" ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                    ACTIVE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    INACTIVE
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between gap-2">
          <div>
            <Button
              variant="outline"
              className="gap-2 text-destructive"
              onClick={handleRemove}
              disabled={
                removing ||
                submitting ||
                loading ||
                isGlobal ||
                !currentAssignment
              }
            >
              <Trash2 size={16} />
              {removing ? "Đang gỡ..." : "Gỡ assignment"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={close}
              disabled={submitting || removing}
            >
              Hủy
            </Button>

            <Button
              onClick={handleSave}
              disabled={
                submitting ||
                removing ||
                loading ||
                isGlobal ||
                !selectedFranchiseId
              }
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFranchiseAssignModal;