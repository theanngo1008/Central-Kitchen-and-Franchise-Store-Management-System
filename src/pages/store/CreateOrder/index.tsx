import React, { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "sonner";
import { RefreshCw, Package, FlaskConical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import CatalogList from "./components/CatalogList";
import IngredientCatalogList from "./components/IngredientCatalogList";
import OrderPanel from "./components/OrderPanel";

import { useStoreCatalog } from "@/hooks/storeOrders/useStoreCatalog";
import { useCreateStoreOrder } from "@/hooks/storeOrders/useCreateStoreOrder";
import { useSubmitStoreOrder } from "@/hooks/storeOrders/useSubmitStoreOrder";
import { useUpdateStoreOrder } from "@/hooks/storeOrders/useUpdateStoreOrder";
import { useStoreOrderDetail } from "@/hooks/storeOrders/useStoreOrderDetail";
import { useIngredients } from "@/hooks/ingredients/useIngredients";

import type { StoreCatalogItem } from "@/types/store/storeCatalog.types";
import type { Ingredient } from "@/types/ingredient";
import type {
  CreateStoreOrderPayload,
  UpdateStoreOrderPayload,
} from "@/types/store/storeOrder.types";

export type OrderDraftItem = {
  productId: number;
  productName: string;
  unit: string;
  price?: number;
  quantity: number;
};

export type IngredientDraftItem = {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;
};

type ActiveTab = "products" | "ingredients";

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

  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [productSearch, setProductSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [note, setNote] = useState("");

  const [productItemsMap, setProductItemsMap] = useState<Record<number, OrderDraftItem>>({});
  const [ingredientItemsMap, setIngredientItemsMap] = useState<Record<number, IngredientDraftItem>>({});

  const {
    data: catalogResponse,
    isLoading: loadingCatalog,
    refetch: refetchCatalog,
  } = useStoreCatalog(franchiseId);

  const {
    data: ingredientsResponse,
    isLoading: loadingIngredients,
    refetch: refetchIngredients,
  } = useIngredients({ status: "ACTIVE", pageSize: 200 });

  const {
    data: detailResponse,
    isLoading: loadingDetail,
  } = useStoreOrderDetail(franchiseId, parsedOrderId);

  const catalog = catalogResponse?.data?.items ?? [];
  const ingredients = ingredientsResponse?.data?.items ?? [];
  const detailOrder = detailResponse?.data;

  const createOrder = useCreateStoreOrder(franchiseId);
  const submitOrder = useSubmitStoreOrder(franchiseId);
  const updateOrder = useUpdateStoreOrder(franchiseId);

  // Populate from existing order when editing
  useEffect(() => {
    if (!isEditMode || !detailOrder) return;

    setOrderDate(detailOrder.orderDate);

    const nextProductMap: Record<number, OrderDraftItem> = {};
    detailOrder.items.forEach((item) => {
      const catalogItem = catalog.find((c) => c.productId === item.productId);
      nextProductMap[item.productId] = {
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        price: catalogItem?.price,
        quantity: item.quantity,
      };
    });
    setProductItemsMap(nextProductMap);

    const nextIngredientMap: Record<number, IngredientDraftItem> = {};
    (detailOrder.ingredientItems ?? []).forEach((item) => {
      nextIngredientMap[item.ingredientId] = {
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        unit: item.unit,
        quantity: item.quantity,
      };
    });
    setIngredientItemsMap(nextIngredientMap);
  }, [isEditMode, detailOrder, catalog]);

  const filteredCatalog = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter(
      (p) =>
        p.productName.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.unit.toLowerCase().includes(term) ||
        p.productType.toLowerCase().includes(term)
    );
  }, [catalog, productSearch]);

  const filteredIngredients = useMemo(() => {
    const term = ingredientSearch.trim().toLowerCase();
    if (!term) return ingredients;
    return ingredients.filter(
      (i) =>
        i.name.toLowerCase().includes(term) ||
        i.unit.toLowerCase().includes(term)
    );
  }, [ingredients, ingredientSearch]);

  const productItems = useMemo(() => Object.values(productItemsMap), [productItemsMap]);
  const ingredientItems = useMemo(() => Object.values(ingredientItemsMap), [ingredientItemsMap]);

  const stats = useMemo(() => {
    const totalCatalog = catalog.length;
    const chosenProducts = productItems.length;
    const chosenIngredients = ingredientItems.length;
    const totalQty =
      productItems.reduce((s, i) => s + i.quantity, 0) +
      ingredientItems.reduce((s, i) => s + i.quantity, 0);
    return { totalCatalog, chosenProducts, chosenIngredients, totalQty };
  }, [catalog, productItems, ingredientItems]);

  const handleAddProduct = (product: StoreCatalogItem) => {
    if (product.status !== "ACTIVE") return;
    setProductItemsMap((prev) => {
      const existed = prev[product.productId];
      return {
        ...prev,
        [product.productId]: {
          productId: product.productId,
          productName: product.productName,
          unit: product.unit,
          price: product.price,
          quantity: (existed?.quantity ?? 0) + 1,
        },
      };
    });
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    if (ingredient.status !== "ACTIVE") return;
    setIngredientItemsMap((prev) => {
      const existed = prev[ingredient.id];
      return {
        ...prev,
        [ingredient.id]: {
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          unit: ingredient.unit,
          quantity: (existed?.quantity ?? 0) + 1,
        },
      };
    });
  };

  const handleChangeProductQty = (productId: number, qty: number) => {
    setProductItemsMap((prev) => {
      if (!prev[productId]) return prev;
      if (qty <= 0) {
        const clone = { ...prev };
        delete clone[productId];
        return clone;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity: qty } };
    });
  };

  const handleChangeIngredientQty = (ingredientId: number, qty: number) => {
    setIngredientItemsMap((prev) => {
      if (!prev[ingredientId]) return prev;
      if (qty <= 0) {
        const clone = { ...prev };
        delete clone[ingredientId];
        return clone;
      }
      return { ...prev, [ingredientId]: { ...prev[ingredientId], quantity: qty } };
    });
  };

  const handleRemoveProduct = (productId: number) => {
    setProductItemsMap((prev) => {
      const clone = { ...prev };
      delete clone[productId];
      return clone;
    });
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    setIngredientItemsMap((prev) => {
      const clone = { ...prev };
      delete clone[ingredientId];
      return clone;
    });
  };

  const canSubmit = useMemo(() => {
    if (!franchiseId) return false;
    if (!orderDate) return false;
    if (productItems.length === 0 && ingredientItems.length === 0) return false;
    return (
      productItems.every((x) => x.quantity > 0) &&
      ingredientItems.every((x) => x.quantity > 0)
    );
  }, [franchiseId, orderDate, productItems, ingredientItems]);

  const buildPayload = (): CreateStoreOrderPayload | UpdateStoreOrderPayload => {
    return {
      orderDate,
      items: productItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
      ...(ingredientItems.length > 0 && {
        ingredientItems: ingredientItems.map((it) => ({
          ingredientId: it.ingredientId,
          quantity: it.quantity,
        })),
      }),
    };
  };

  const handleCreateDraft = async () => {
    if (!canSubmit) return;
    if (isEditMode) {
      try {
        await updateOrder.mutateAsync({ orderId: parsedOrderId, payload: buildPayload() as UpdateStoreOrderPayload });
        toast.success(`Đã cập nhật đơn #${parsedOrderId}`);
        navigate(`/stores/${storeId ?? franchiseId}/orders`);
      } catch (e) {
        console.error(e);
        toast.error("Cập nhật đơn thất bại");
      }
      return;
    }
    try {
      const created = await createOrder.mutateAsync(buildPayload() as CreateStoreOrderPayload);
      const storeOrderId = created?.data?.storeOrderId;
      if (!storeOrderId) { toast.error("Không lấy được mã đơn hàng sau khi tạo"); return; }
      toast.success(`Đã tạo đơn #${storeOrderId} (DRAFT)`);
      setProductItemsMap({});
      setIngredientItemsMap({});
      setNote("");
    } catch (e: any) {
      console.error("[CreateOrder] create draft error:", e?.response?.data ?? e);
      const msg = e?.response?.data?.message || e?.message || "Tạo đơn thất bại";
      toast.error(msg);
    }
  };

  const handleCreateAndSubmit = async () => {
    if (!canSubmit) return;
    if (isEditMode) {
      try {
        await updateOrder.mutateAsync({ orderId: parsedOrderId, payload: buildPayload() as UpdateStoreOrderPayload });
        toast.success(`Đã cập nhật đơn #${parsedOrderId}`);
        navigate(`/stores/${storeId ?? franchiseId}/orders`);
      } catch (e) {
        console.error(e);
        toast.error("Cập nhật đơn thất bại");
      }
      return;
    }
    try {
      const created = await createOrder.mutateAsync(buildPayload() as CreateStoreOrderPayload);
      const storeOrderId = created?.data?.storeOrderId;
      if (!storeOrderId) { toast.error("Không lấy được mã đơn hàng sau khi tạo"); return; }
      await submitOrder.mutateAsync(storeOrderId);
      toast.success(`Đã gửi đơn #${storeOrderId}`);
      setProductItemsMap({});
      setIngredientItemsMap({});
      setNote("");
    } catch (e: any) {
      console.error("[CreateOrder] create+submit error:", e?.response?.data ?? e);
      const msg = e?.response?.data?.message || e?.message || "Gửi đơn thất bại";
      toast.error(msg);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchCatalog(), refetchIngredients()]);
      toast.success("Đã refresh danh sách");
    } catch (e) {
      console.error(e);
      toast.error("Refresh thất bại");
    }
  };

  const pageTitle = isEditMode ? "Chỉnh sửa đơn hàng" : "Tạo đơn đặt hàng";
  const pageSubtitle = isEditMode
    ? `Cập nhật thông tin đơn hàng #${parsedOrderId}`
    : "Chọn sản phẩm và/hoặc nguyên liệu để tạo Store Order";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={{ label: "Refresh", icon: RefreshCw, onClick: handleRefresh }}
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalCatalog}</p>
          <p className="text-sm text-muted-foreground">Sản phẩm trong catalog</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{stats.chosenProducts}</p>
          <p className="text-sm text-muted-foreground">Sản phẩm đã chọn</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.chosenIngredients}</p>
          <p className="text-sm text-muted-foreground">Nguyên liệu đã chọn</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-2xl font-bold">{stats.totalQty}</p>
          <p className="text-sm text-muted-foreground">Tổng số lượng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tab + catalog */}
        <div className="lg:col-span-7">
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "products"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Package size={16} />
              Sản phẩm
              {stats.chosenProducts > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {stats.chosenProducts}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ingredients")}
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "ingredients"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <FlaskConical size={16} />
              Nguyên liệu
              {stats.chosenIngredients > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {stats.chosenIngredients}
                </span>
              )}
            </button>
          </div>

          {activeTab === "products" ? (
            <CatalogList
              loading={loadingCatalog || (isEditMode && loadingDetail)}
              items={filteredCatalog}
              searchTerm={productSearch}
              onSearchTermChange={setProductSearch}
              onAdd={handleAddProduct}
              onRefresh={handleRefresh}
            />
          ) : (
            <IngredientCatalogList
              loading={loadingIngredients}
              items={filteredIngredients}
              searchTerm={ingredientSearch}
              onSearchTermChange={setIngredientSearch}
              onAdd={handleAddIngredient}
            />
          )}
        </div>

        {/* Right: Order panel */}
        <div className="lg:col-span-5">
          <OrderPanel
            orderDate={orderDate}
            onOrderDateChange={setOrderDate}
            note={note}
            onNoteChange={setNote}
            items={productItems}
            ingredientItems={ingredientItems}
            onChangeQty={handleChangeProductQty}
            onRemoveItem={handleRemoveProduct}
            onChangeIngredientQty={handleChangeIngredientQty}
            onRemoveIngredient={handleRemoveIngredient}
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