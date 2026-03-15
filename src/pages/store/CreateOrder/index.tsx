import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import CatalogList from "./components/CatalogList";
import OrderPanel from "./components/OrderPanel";

import { useStoreCatalog } from "@/hooks/storeOrders/useStoreCatalog";
import { useCreateStoreOrder } from "@/hooks/storeOrders/useCreateStoreOrder";
import { useSubmitStoreOrder } from "@/hooks/storeOrders/useSubmitStoreOrder";
import { useUpdateStoreOrder } from "@/hooks/storeOrders/useUpdateStoreOrder";
import { useStoreOrderDetail } from "@/hooks/storeOrders/useStoreOrderDetail";

import type { StoreCatalogItem } from "@/types/store/storeCatalog.types";
import type {
  CreateStoreOrderPayload,
  UpdateStoreOrderPayload,
} from "@/types/store/storeOrder.types";

type OrderDraftItem = {
  productId: number;
  productName: string;
  unit: string;
  price?: number;
  quantity: number;
};

const getCurrentFranchiseId = () => {
  const keys = ["franchiseId", "selectedFranchiseId", "currentFranchiseId"];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

const CreateOrderPage: React.FC = () => {
  const franchiseId = getCurrentFranchiseId();
  const navigate = useNavigate();
  const { orderId, storeId } = useParams();

  const isEditMode = !!orderId;
  const parsedOrderId = orderId ? Number(orderId) : 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [note, setNote] = useState("");

  const [itemsMap, setItemsMap] = useState<Record<number, OrderDraftItem>>({});

  const {
    data: catalogResponse,
    isLoading: loadingCatalog,
    refetch: refetchCatalog,
  } = useStoreCatalog(franchiseId);

  const {
    data: detailResponse,
    isLoading: loadingDetail,
  } = useStoreOrderDetail(franchiseId, parsedOrderId);

  const catalog = catalogResponse?.data?.items ?? [];
  const detailOrder = detailResponse?.data;

  const createOrder = useCreateStoreOrder(franchiseId);
  const submitOrder = useSubmitStoreOrder(franchiseId);
  const updateOrder = useUpdateStoreOrder(franchiseId);

  useEffect(() => {
    if (!isEditMode || !detailOrder) return;

    setOrderDate(detailOrder.orderDate);

    const nextItemsMap: Record<number, OrderDraftItem> = {};
    detailOrder.items.forEach((item) => {
      const catalogItem = catalog.find((c) => c.productId === item.productId);

      nextItemsMap[item.productId] = {
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        price: catalogItem?.price,
        quantity: item.quantity,
      };
    });

    setItemsMap(nextItemsMap);
  }, [isEditMode, detailOrder, catalog]);

  const filteredCatalog = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return catalog;

    return catalog.filter((p) => {
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
    const totalCatalog = catalog.length;
    const activeCatalog = catalog.filter((x) => x.status === "ACTIVE").length;
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

  const buildPayload = (): CreateStoreOrderPayload | UpdateStoreOrderPayload => {
    return {
      orderDate,
      items: orderItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    };
  };

  const handleCreateDraft = async () => {
    if (!canSubmit) return;

    if (isEditMode) {
      try {
        const payload = buildPayload() as UpdateStoreOrderPayload;

        await updateOrder.mutateAsync({
          orderId: parsedOrderId,
          payload,
        });

        toast.success(`Đã cập nhật đơn #${parsedOrderId}`);
        navigate(`/stores/${storeId ?? franchiseId}/orders`);
      } catch (e) {
        console.error(e);
        toast.error("Cập nhật đơn thất bại");
      }
      return;
    }

    try {
      const payload = buildPayload() as CreateStoreOrderPayload;
      const created = await createOrder.mutateAsync(payload);
      const storeOrderId = created?.data?.storeOrderId;

      if (!storeOrderId) {
        toast.error("Không lấy được mã đơn hàng sau khi tạo");
        return;
      }

      toast.success(`Đã tạo đơn #${storeOrderId} (DRAFT)`);
      setItemsMap({});
      setNote("");
    } catch (e) {
      console.error(e);
      toast.error("Tạo đơn thất bại");
    }
  };

  const handleCreateAndSubmit = async () => {
    if (!canSubmit) return;

    if (isEditMode) {
      try {
        const payload = buildPayload() as UpdateStoreOrderPayload;

        await updateOrder.mutateAsync({
          orderId: parsedOrderId,
          payload,
        });

        toast.success(`Đã cập nhật đơn #${parsedOrderId}`);
        navigate(`/stores/${storeId ?? franchiseId}/orders`);
      } catch (e) {
        console.error(e);
        toast.error("Cập nhật đơn thất bại");
      }
      return;
    }

    try {
      const payload = buildPayload() as CreateStoreOrderPayload;
      const created = await createOrder.mutateAsync(payload);
      const storeOrderId = created?.data?.storeOrderId;

      if (!storeOrderId) {
        toast.error("Không lấy được mã đơn hàng sau khi tạo");
        return;
      }

      await submitOrder.mutateAsync(storeOrderId);
      toast.success(`Đã gửi đơn #${storeOrderId}`);
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

  const pageTitle = isEditMode ? "Chỉnh sửa đơn hàng" : "Tạo đơn đặt hàng";
  const pageSubtitle = isEditMode
    ? `Cập nhật thông tin đơn hàng #${parsedOrderId}`
    : "Chọn sản phẩm từ catalog và tạo Store Order";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={{
          label: "Refresh",
          icon: RefreshCw,
          onClick: handleRefresh,
        }}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalCatalog}</p>
          <p className="text-sm text-muted-foreground">
            Sản phẩm trong catalog
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CatalogList
            loading={loadingCatalog || (isEditMode && loadingDetail)}
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
            submitting={
              createOrder.isPending ||
              submitOrder.isPending ||
              updateOrder.isPending
            }
            canSubmit={canSubmit}
            mode={isEditMode ? "edit" : "create"}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;