import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, PackageOpen } from "lucide-react";
import { useLocation } from "react-router-dom";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { useCreateProductionPlan } from "@/hooks/kitchen/useCreateProductionPlan";
import { useProductionPlanByDate } from "@/hooks/kitchen/useProductionPlanByDate";
import { useProductionPlanDetail } from "@/hooks/kitchen/useProductionPlanDetail";
import { useUpdateProductionPlanStatus } from "@/hooks/kitchen/useUpdateProductionPlanStatus";
import { useIssueIngredientsByProductionPlan } from "@/hooks/kitchen/useIssueIngredientsByProductionPlan";

import CreateProductionPlanForm from "./components/CreateProductionPlanForm";
import ProductionPlanSummaryCard from "./components/ProductionPlanSummaryCard";
import ProductionPlanItemsTable from "./components/ProductionPlanItemsTable";
import ProductionPlanStatusActions from "./components/ProductionPlanStatusActions";
import IssueIngredientsDialog from "./components/IssueIngredientsDialog";
import IssuedIngredientsResultDialog from "./components/IssuedIngredientsResultDialog";

import type { ProductionPlanStatus } from "@/types/kitchen/productionPlan.types";
import type { IssueIngredientsByProductionPlanResult } from "@/types/kitchen/inventoryIssue.types";

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
    localStorage.getItem("centralKitchenId") ?? 0,
  );

  const [planDate, setPlanDate] = useState<string>(
    prefilledPlanDate || getTodayString(),
  );
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueResult, setIssueResult] =
    useState<IssueIngredientsByProductionPlanResult | null>(null);

  const createPlanMutation = useCreateProductionPlan(centralKitchenId);
  const loadPlanByDateMutation = useProductionPlanByDate(centralKitchenId);
  const issueIngredientsMutation =
    useIssueIngredientsByProductionPlan(centralKitchenId);

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
    currentPlanId ?? 0,
  );

  const isStatusUpdating = updateStatusMutation.isPending;
  const isPlanLoading = detailLoading || detailFetching;

  const canIssueIngredients =
    currentPlan?.status === "CONFIRMED" ||
    currentPlan?.status === "IN_PROGRESS";

  const pageSubtitle = useMemo(() => {
    if (currentPlan) {
      return `Đang xem production plan #${currentPlan.productionPlanId} - ${currentPlan.planDate}`;
    }

    if (sourceOrderCode && sourceFranchiseName) {
      return `Khởi tạo kế hoạch sản xuất từ ${sourceOrderCode} - ${sourceFranchiseName}`;
    }

    return "Tạo hoặc tải kế hoạch sản xuất theo ngày từ các LOCKED orders";
  }, [currentPlan, sourceOrderCode, sourceFranchiseName]);

  const openPlan = (productionPlanId: number) => {
    setCurrentPlanId(productionPlanId);
  };

  const handleIssueIngredients = async (reason: string) => {
    if (!currentPlanId || !centralKitchenId) {
      toast.error("Missing production plan context.");
      return;
    }

    try {
      const response = await issueIngredientsMutation.mutateAsync({
        productionPlanId: currentPlanId,
        payload: {
          reason: reason || undefined,
        },
      });

      setIssueDialogOpen(false);
      setIssueResult(response.data);

      toast.success("Ingredients issued successfully.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to issue ingredients.",
      );
    }
  };

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

      openPlan(createdPlanId);
      toast.success("Production plan created successfully.");
    } catch (error: any) {
      const responseData = error?.response?.data;
      const existingPlanId = responseData?.data?.existingProductionPlanId;
      const errorCode = responseData?.errorCode;

      if (errorCode === "CONFLICT" && existingPlanId) {
        openPlan(existingPlanId);
        toast.info(
          `Production plan already exists. Opened plan #${existingPlanId}.`,
        );
        return;
      }

      toast.error(
        getApiErrorMessage(error, "Failed to create production plan."),
      );
    }
  };

  const handleLoadPlanByDate = async () => {
    if (!centralKitchenId) {
      toast.error("Missing centralKitchenId in current login session.");
      return;
    }

    if (!planDate) {
      toast.error("Please select plan date.");
      return;
    }

    try {
      const response = await loadPlanByDateMutation.mutateAsync(planDate);
      const foundPlanId = response.data.productionPlanId;

      openPlan(foundPlanId);
      toast.success(`Loaded production plan #${foundPlanId}.`);
    } catch (error: any) {
      toast.error(
        getApiErrorMessage(
          error,
          "No production plan found for the selected date.",
        ),
      );
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
    reason: string,
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
        getApiErrorMessage(error, "Failed to update production plan status."),
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

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleLoadPlanByDate}
          disabled={loadPlanByDateMutation.isPending || !planDate}
        >
          {loadPlanByDateMutation.isPending ? "Loading..." : "Load Plan"}
        </Button>
      </div>

      {!currentPlanId ? (
        <div className="rounded-xl border bg-background p-8 text-center">
          <h3 className="text-base font-semibold">
            No Production Plan Selected
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn có thể tạo mới hoặc tải production plan theo ngày.
          </p>
        </div>
      ) : detailError ? (
        <div className="rounded-xl border bg-background p-6 text-sm text-destructive">
          Failed to load production plan detail. Vui lòng kiểm tra lại dữ liệu
          plan.
        </div>
      ) : isPlanLoading && !currentPlan ? (
        <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading production plan detail...
        </div>
      ) : currentPlan ? (
        <>
          <ProductionPlanSummaryCard plan={currentPlan} />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="default"
              onClick={() => setIssueDialogOpen(true)}
              disabled={
                !canIssueIngredients || issueIngredientsMutation.isPending
              }
            >
              <PackageOpen className="mr-2 h-4 w-4" />
              Issue Ingredients
            </Button>
          </div>

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
              createPlanMutation.isPending ||
              loadPlanByDateMutation.isPending ||
              isPlanLoading ||
              isStatusUpdating ||
              issueIngredientsMutation.isPending
            }
          >
            Clear Current Plan
          </Button>
        </div>
      )}

      <IssueIngredientsDialog
        open={issueDialogOpen}
        loading={issueIngredientsMutation.isPending}
        onClose={() => setIssueDialogOpen(false)}
        onSubmit={handleIssueIngredients}
      />

      <IssuedIngredientsResultDialog
        open={!!issueResult}
        result={issueResult}
        onClose={() => setIssueResult(null)}
      />
    </div>
  );
};

export default ProductionPlanningPage;