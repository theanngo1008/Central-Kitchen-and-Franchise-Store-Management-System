import React, { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";

import CatalogList from "./components/CatalogList";
import OrderPanel from "./components/OrderPanel";

import { useStoreCatalog } from "@/hooks/storeOrders/useStoreCatalog";
import { useCreateStoreOrder } from "@/hooks/storeOrders/useCreateStoreOrder";
import { useSubmitStoreOrder } from "@/hooks/storeOrders/useSubmitStoreOrder";

import type { StoreCatalogItem } from "@/types/store/storeCatalog.types";
import type { CreateStoreOrderPayload } from "@/types/store/storeOrder.types";

type OrderDraftItem = {
  productId: number;
  productName: string;
  unit: string;
  price?: number;
  quantity: number;
};

const getCurrentFranchiseId = () => {
  // TODO: đổi theo project bạn nếu đã có auth context
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

const CreateOrderPage: React.FC = () => {
  const franchiseId = getCurrentFranchiseId();

  const [searchTerm, setSearchTerm] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [note, setNote] = useState("");

  // draft items keyed by productId
  const [itemsMap, setItemsMap] = useState<Record<number, OrderDraftItem>>({});

  const {
    data: catalog,
    isLoading: loadingCatalog,
    refetch: refetchCatalog,
  } = useStoreCatalog(franchiseId);

  const createOrder = useCreateStoreOrder(franchiseId);
  const submitOrder = useSubmitStoreOrder(franchiseId);

  const filteredCatalog = useMemo(() => {
    const list = catalog ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter((p) => {
      return (
        p.productName.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.unit.toLowerCase().includes(term) ||
        p.productType.toLowerCase().includes(term)
      );
    });
  }, [catalog, searchTerm]);

  const orderItems = useMemo(() => Object.values(itemsMap), [itemsMap]);

  const stats = useMemo(() => {
    const totalCatalog = catalog?.length ?? 0;
    const activeCatalog = (catalog ?? []).filter((x) => x.status === "ACTIVE")
      .length;
    const chosen = orderItems.length;
    const totalQty = orderItems.reduce((sum, it) => sum + it.quantity, 0);
    return { totalCatalog, activeCatalog, chosen, totalQty };
  }, [catalog, orderItems]);

  const handleAddFromCatalog = (product: StoreCatalogItem) => {
    if (product.status !== "ACTIVE") return;

    setItemsMap((prev) => {
      const existed = prev[product.productId];
      const nextQty = (existed?.quantity ?? 0) + 1;

      return {
        ...prev,
        [product.productId]: {
          productId: product.productId,
          productName: product.productName,
          unit: product.unit,
          price: product.price,
          quantity: nextQty,
        },
      };
    });
  };

  const handleChangeQty = (productId: number, qty: number) => {
    setItemsMap((prev) => {
      if (!prev[productId]) return prev;
      if (qty <= 0) {
        const clone = { ...prev };
        delete clone[productId];
        return clone;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity: qty } };
    });
  };

  const handleRemoveItem = (productId: number) => {
    setItemsMap((prev) => {
      const clone = { ...prev };
      delete clone[productId];
      return clone;
    });
  };

  const canSubmit = useMemo(() => {
    if (!franchiseId) return false;
    if (!orderDate) return false;
    if (orderItems.length === 0) return false;
    return orderItems.every((x) => x.quantity > 0);
  }, [franchiseId, orderDate, orderItems]);

  const buildPayload = (): CreateStoreOrderPayload => {
    return {
      orderDate,
      items: orderItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
      // NOTE: note currently not in payload type -> nếu BE có nhận thì thêm field vào type + payload
    };
  };

  const handleCreateDraft = async () => {
    if (!canSubmit) return;
    try {
      const payload = buildPayload();
      const created = await createOrder.mutateAsync(payload);
      toast.success(`Đã tạo đơn #${created.storeOrderId} (DRAFT)`);
      // reset draft after create
      setItemsMap({});
      setNote("");
    } catch (e) {
      console.error(e);
      toast.error("Tạo đơn thất bại");
    }
  };

  const handleCreateAndSubmit = async () => {
    if (!canSubmit) return;
    try {
      const payload = buildPayload();
      const created = await createOrder.mutateAsync(payload);
      await submitOrder.mutateAsync(created.storeOrderId);
      toast.success(`Đã gửi đơn #${created.storeOrderId}`);
      setItemsMap({});
      setNote("");
    } catch (e) {
      console.error(e);
      toast.error("Gửi đơn thất bại");
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchCatalog();
      toast.success("Đã refresh catalog");
    } catch (e) {
      console.error(e);
      toast.error("Refresh thất bại");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tạo đơn đặt hàng"
        subtitle="Chọn sản phẩm từ catalog và tạo Store Order"
        action={{
          label: "Refresh",
          icon: RefreshCw,
          onClick: handleRefresh,
        }}
      />

      {/* Stats giống UserManagement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalCatalog}</p>
          <p className="text-sm text-muted-foreground">Sản phẩm trong catalog</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-success">
            {stats.activeCatalog}
          </p>
          <p className="text-sm text-muted-foreground">Đang ACTIVE</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{stats.chosen}</p>
          <p className="text-sm text-muted-foreground">Đã chọn</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalQty}</p>
          <p className="text-sm text-muted-foreground">Tổng số lượng</p>
        </div>
      </div>

      {/* Layout: left catalog - right order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CatalogList
            loading={loadingCatalog}
            items={filteredCatalog}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onAdd={handleAddFromCatalog}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="lg:col-span-5">
          <OrderPanel
            orderDate={orderDate}
            onOrderDateChange={setOrderDate}
            note={note}
            onNoteChange={setNote}
            items={orderItems}
            onChangeQty={handleChangeQty}
            onRemoveItem={handleRemoveItem}
            onCreateDraft={handleCreateDraft}
            onCreateAndSubmit={handleCreateAndSubmit}
            submitting={createOrder.isPending || submitOrder.isPending}
            canSubmit={canSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;