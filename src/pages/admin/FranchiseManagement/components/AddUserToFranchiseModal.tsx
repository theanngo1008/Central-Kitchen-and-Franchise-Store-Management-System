import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { adminUsersApi } from "@/api/admin/users.api";
import { adminUserFranchisesApi } from "@/api/admin/userFranchises.api";
import type { AdminUser } from "@/types/admin/user.types";
import type { AdminFranchise } from "@/types/admin/franchise.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franchise: AdminFranchise;
  onAssigned?: () => void | Promise<void>;
};

const normalize = (s?: string) => (s || "").trim().toLowerCase();

const isUserAllowedForStore = (user: AdminUser) => {
  const role = normalize(user.roleName);

  if (role === "admin" || role === "manager") return false;

  return role === "storestaff";
};

export const AddUserToFranchiseModal: React.FC<Props> = ({
  open,
  onOpenChange,
  franchise,
  onAssigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSelected(null);
    setQ("");

    const run = async () => {
      try {
        setLoading(true);
        const data = await adminUsersApi.list();

        const allowed = data.filter((u) => isUserAllowedForStore(u));

        const freeUsers: AdminUser[] = [];
        const chunkSize = 8;

        for (let i = 0; i < allowed.length; i += chunkSize) {
          const chunk = allowed.slice(i, i + chunkSize);

          const results = await Promise.allSettled(
            chunk.map((u) => adminUserFranchisesApi.getByUser(u.userId)),
          );

          results.forEach((r, idx) => {
            const u = chunk[idx];

            if (r.status === "rejected") {
              freeUsers.push(u);
              return;
            }

            if (!r.value) {
              freeUsers.push(u);
            }
          });
        }

        setUsers(freeUsers);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách user");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [open]);

  const filtered = useMemo(() => {
    const term = normalize(q);
    const base = users.filter((u) => isUserAllowedForStore(u));

    if (!term) return base;

    return base.filter(
      (u) =>
        normalize(u.username).includes(term) ||
        normalize(u.email).includes(term) ||
        normalize(u.roleName).includes(term),
    );
  }, [users, q]);

  const handleSubmit = async () => {
    if (!selected) {
      toast.error("Vui lòng chọn 1 user");
      return;
    }

    const role = normalize(selected.roleName);
    if (role === "admin" || role === "manager") {
      toast.error("Role này không thể gán vào cửa hàng");
      return;
    }

    if (role !== "storestaff") {
      toast.error("Chỉ StoreStaff mới có thể gán vào cửa hàng");
      return;
    }

    try {
      setSubmitting(true);

      await adminUserFranchisesApi.assign({
        userId: selected.userId,
        assignmentType: "FRANCHISE",
        franchiseId: franchise.franchiseId,
        centralKitchenId: null,
      });

      toast.success("Đã gán user vào cửa hàng");
      onOpenChange(false);
      await onAssigned?.();
    } catch (e: any) {
      console.error(e);

      const data = e?.response?.data;
      const errors: string[] = Array.isArray(data?.errors) ? data.errors : [];
      const message: string =
        typeof data?.message === "string" ? data.message : "";
      const raw = (errors.join(" ") + " " + message).toLowerCase();

      const isAlreadyAssigned =
        raw.includes("already assigned") ||
        raw.includes("already has") ||
        raw.includes("duplicate") ||
        raw.includes("saving the entity changes") ||
        raw.includes("inner exception");

      if (isAlreadyAssigned) {
        toast.error(
          "User đã thuộc nơi làm việc khác (1 user chỉ thuộc 1 nơi).",
        );

        if (selected) {
          setUsers((prev) => prev.filter((u) => u.userId !== selected.userId));
          setSelected(null);
        }
        return;
      }

      toast.error(message || "Gán user thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add user vào Cửa hàng: {franchise.name}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Chỉ hiển thị user StoreStaff chưa được gán nơi làm việc.
        </p>

        <div className="space-y-3">
          <Input
            placeholder="Tìm theo username / email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="border rounded-xl overflow-hidden">
            <div className="max-h-[360px] overflow-auto">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Đang tải...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Không có user phù hợp để gán.
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((u) => {
                    const active = selected?.userId === u.userId;
                    return (
                      <button
                        key={u.userId}
                        type="button"
                        onClick={() => setSelected(u)}
                        className={`w-full text-left p-3 hover:bg-muted/40 transition ${
                          active ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-medium">
                              {u.username}{" "}
                              <span className="text-xs text-muted-foreground">
                                #{u.userId}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {u.email}
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full border">
                            {u.roleName}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !selected}>
              {submitting ? "Đang lưu..." : "Gán user"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
