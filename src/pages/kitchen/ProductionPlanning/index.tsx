import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { useCreateProductionPlan } from "@/hooks/kitchen/useCreateProductionPlan";
import { useProductionPlanDetail } from "@/hooks/kitchen/useProductionPlanDetail";
import { useUpdateProductionPlanStatus } from "@/hooks/kitchen/useUpdateProductionPlanStatus";

import CreateProductionPlanForm from "./components/CreateProductionPlanForm";
import LoadProductionPlanByIdForm from "./components/LoadProductionPlanByIdForm";
import ProductionPlanSummaryCard from "./components/ProductionPlanSummaryCard";
import ProductionPlanItemsTable from "./components/ProductionPlanItemsTable";
import ProductionPlanStatusActions from "./components/ProductionPlanStatusActions";

import type { ProductionPlanStatus } from "@/types/kitchen/productionPlan.types";

type ProductionPlanningLocationState = {
  planDate?: string;
  source?: string;
  storeOrderId?: number;
  orderCode?: string;
  franchiseName?: string;
} | null;

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getApiErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

const ProductionPlanningPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const locationState = location.state as ProductionPlanningLocationState;
  const prefilledPlanDate = locationState?.planDate ?? "";
  const sourceOrderCode = locationState?.orderCode ?? "";
  const sourceFranchiseName = locationState?.franchiseName ?? "";

  const centralKitchenId = Number(
    localStorage.getItem("centralKitchenId") ?? 0
  );

  const [planDate, setPlanDate] = useState<string>(
    prefilledPlanDate || getTodayString()
  );
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [lookupPlanId, setLookupPlanId] = useState<string>("");

  const createPlanMutation = useCreateProductionPlan(centralKitchenId);

  const {
    data: detailResponse,
    isLoading: detailLoading,
    isFetching: detailFetching,
    isError: detailError,
    refetch: refetchDetail,
  } = useProductionPlanDetail(centralKitchenId, currentPlanId ?? undefined);

  const currentPlan = detailResponse?.data;

  const updateStatusMutation = useUpdateProductionPlanStatus(
    centralKitchenId,
    currentPlanId ?? 0
  );

  const isStatusUpdating = updateStatusMutation.isPending;
  const isPlanLoading = detailLoading || detailFetching;

  const pageSubtitle = useMemo(() => {
    if (currentPlan) {
      return `Đang xem production plan #${currentPlan.productionPlanId} - ${currentPlan.planDate}`;
    }

    if (sourceOrderCode && sourceFranchiseName) {
      return `Khởi tạo kế hoạch sản xuất từ ${sourceOrderCode} - ${sourceFranchiseName}`;
    }

    return "Tạo kế hoạch sản xuất theo ngày từ các LOCKED orders";
  }, [currentPlan, sourceOrderCode, sourceFranchiseName]);

  const handleCreatePlan = async () => {
    if (!centralKitchenId) {
      toast.error("Missing centralKitchenId in current login session.");
      return;
    }

    if (!planDate) {
      toast.error("Please select plan date.");
      return;
    }

    try {
      const response = await createPlanMutation.mutateAsync({ planDate });
      const createdPlanId = response.data.productionPlanId;

      setCurrentPlanId(createdPlanId);
      setLookupPlanId(String(createdPlanId));

      toast.success("Production plan created successfully.");
    } catch (error: any) {
      toast.error(
        getApiErrorMessage(error, "Failed to create production plan.")
      );
    }
  };

  const handleLoadPlanById = async () => {
    if (!centralKitchenId) {
      toast.error("Missing centralKitchenId in current login session.");
      return;
    }

    const parsedId = Number(lookupPlanId);

    if (!parsedId || parsedId <= 0) {
      toast.error("Please enter a valid production plan id.");
      return;
    }

    try {
      setCurrentPlanId(parsedId);
      toast.success(`Loading production plan #${parsedId}...`);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to load production plan."));
    }
  };

  const handleRefreshCurrentPlan = async () => {
    if (!currentPlanId) {
      toast.info("No production plan selected yet.");
      return;
    }

    try {
      await refetchDetail();
      toast.success("Production plan refreshed.");
    } catch {
      toast.error("Failed to refresh production plan.");
    }
  };

  const handleUpdateStatus = async (
    nextStatus: ProductionPlanStatus,
    reason: string
  ) => {
    if (!currentPlanId || !centralKitchenId) {
      toast.error("Missing production plan context.");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        status: nextStatus,
        reason,
      });

      await refetchDetail();

      toast.success(`Production plan updated to ${nextStatus}.`);
    } catch (error: any) {
      toast.error(
        getApiErrorMessage(error, "Failed to update production plan status.")
      );
    }
  };

  if (!user) return null;

  if (!centralKitchenId) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader
          title="Production Planning"
          subtitle="Create and manage production plans for central kitchen"
        />
        <div className="rounded-lg border bg-background p-6 text-sm text-destructive">
          Missing centralKitchenId in current login session.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Production Planning"
        subtitle={pageSubtitle}
        action={
          currentPlanId
            ? {
                label: isPlanLoading ? "Refreshing..." : "Refresh Plan",
                icon: isPlanLoading ? Loader2 : undefined,
                onClick: handleRefreshCurrentPlan,
              }
            : undefined
        }
      />

      <CreateProductionPlanForm
        planDate={planDate}
        onPlanDateChange={setPlanDate}
        onSubmit={handleCreatePlan}
        loading={createPlanMutation.isPending}
      />

      <LoadProductionPlanByIdForm
        productionPlanId={lookupPlanId}
        onProductionPlanIdChange={setLookupPlanId}
        onSubmit={handleLoadPlanById}
        loading={isPlanLoading}
      />

      {!currentPlanId ? (
        <div className="rounded-xl border bg-background p-8 text-center">
          <h3 className="text-base font-semibold">
            No Production Plan Selected
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn có thể tạo mới theo ngày hoặc tải production plan hiện có bằng
            ID.
          </p>
        </div>
      ) : detailError ? (
        <div className="rounded-xl border bg-background p-6 text-sm text-destructive">
          Failed to load production plan detail. Vui lòng kiểm tra lại
          productionPlanId.
        </div>
      ) : isPlanLoading && !currentPlan ? (
        <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading production plan detail...
        </div>
      ) : currentPlan ? (
        <>
          <ProductionPlanSummaryCard plan={currentPlan} />

          <ProductionPlanStatusActions
            plan={currentPlan}
            loading={isStatusUpdating}
            onUpdateStatus={handleUpdateStatus}
          />

          <ProductionPlanItemsTable items={currentPlan.items} />
        </>
      ) : null}

      {currentPlanId && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCurrentPlanId(null);
            }}
            disabled={
              createPlanMutation.isPending || isPlanLoading || isStatusUpdating
            }
          >
            Clear Current Plans
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanningPage;