import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Store, Factory, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { adminFranchisesApi } from "@/api/admin/franchises.api";
import { adminCentralKitchensApi } from "@/api/admin/centralKitchens.api";
import type {
  AdminFranchise,
  CentralKitchenOption,
  CreateFranchisePayload,
  UpdateFranchisePayload,
} from "@/types/admin/franchise.types";
import type { AdminCentralKitchen } from "@/types/admin/centralKitchen.types";
import {
  CentralKitchensGrid,
  FranchisesGrid,
  FranchisesToolbar,
  FranchiseUpsertModal,
} from "./components";

type TabKey = "STORE" | "CENTRAL_KITCHEN";

const FranchiseManagement: React.FC = () => {
  const [items, setItems] = useState<AdminFranchise[]>([]);
  const [kitchens, setKitchens] = useState<AdminCentralKitchen[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<TabKey>("STORE");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdminFranchise | null>(null);

  const load = async () => {
    try {
      setLoading(true);

      const [storeData, kitchenData] = await Promise.all([
        adminFranchisesApi.list(),
        adminCentralKitchensApi.list(),
      ]);

      setItems(storeData || []);
      setKitchens(kitchenData || []);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách cửa hàng / bếp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const kitchenOptions = useMemo<CentralKitchenOption[]>(() => {
    return (kitchens || [])
      .map((item) => ({
        value: item.centralKitchenId,
        label: item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [kitchens]);

  const stats = useMemo(() => {
    const stores = items.length;
    const kitchensCount = kitchens.length;
    const active =
      items.filter((x) => x.status === "ACTIVE").length +
      kitchens.filter((x) => x.status === "ACTIVE").length;
    const inactive =
      items.filter((x) => x.status === "INACTIVE").length +
      kitchens.filter((x) => x.status === "INACTIVE").length;

    return { stores, kitchens: kitchensCount, active, inactive };
  }, [items, kitchens]);

  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(term) ||
        x.address.toLowerCase().includes(term) ||
        x.location.toLowerCase().includes(term) ||
        x.centralKitchenName?.toLowerCase().includes(term),
    );
  }, [items, searchTerm]);

  const filteredKitchens = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return kitchens;

    return kitchens.filter(
      (x) =>
        x.name.toLowerCase().includes(term) ||
        x.address.toLowerCase().includes(term) ||
        x.location.toLowerCase().includes(term),
    );
  }, [kitchens, searchTerm]);

  const handleOpenCreate = () => {
    if (tab === "CENTRAL_KITCHEN") {
      toast.info("Tạo / sửa bếp trung tâm sẽ xử lý ở luồng riêng.");
      return;
    }

    setSelected(null);
    setOpen(true);
  };

  const handleOpenEdit = (f: AdminFranchise) => {
    setSelected(f);
    setOpen(true);
  };

  const handleCreate = async (payload: CreateFranchisePayload) => {
    try {
      await adminFranchisesApi.create(payload);
      toast.success("Đã thêm cửa hàng");
      setOpen(false);
      setSelected(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Tạo cửa hàng thất bại");
    }
  };

  const handleUpdate = async (id: number, payload: UpdateFranchisePayload) => {
    try {
      await adminFranchisesApi.update(id, payload);
      toast.success("Đã cập nhật cửa hàng");
      setOpen(false);
      setSelected(null);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật cửa hàng thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminFranchisesApi.remove(id);
      toast.success("Đã xóa cửa hàng");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Xóa cửa hàng thất bại");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quản lý Cửa hàng & Bếp"
        subtitle="Quản lý danh sách cửa hàng và thông tin bếp trung tâm"
        action={
          tab === "STORE"
            ? { label: "Thêm", icon: Plus, onClick: handleOpenCreate }
            : undefined
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.stores}</p>
              <p className="text-sm text-muted-foreground">Cửa hàng</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Factory className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.kitchens}</p>
              <p className="text-sm text-muted-foreground">Bếp trung tâm</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <XCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Tạm ngưng</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="STORE" className="gap-2">
              <Store size={16} />
              Cửa hàng ({stats.stores})
            </TabsTrigger>
            <TabsTrigger value="CENTRAL_KITCHEN" className="gap-2">
              <Factory size={16} />
              Bếp trung tâm ({stats.kitchens})
            </TabsTrigger>
          </TabsList>
        </div>

        <FranchisesToolbar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onRefresh={load}
          loading={loading}
        />

        <TabsContent value="STORE">
          <FranchisesGrid
            items={filteredStores}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="CENTRAL_KITCHEN">
          <CentralKitchensGrid items={filteredKitchens} loading={loading} />
        </TabsContent>
      </Tabs>

      <FranchiseUpsertModal
        open={open}
        onOpenChange={setOpen}
        selected={selected}
        kitchenOptions={kitchenOptions}
        existingFranchises={items}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default FranchiseManagement;
