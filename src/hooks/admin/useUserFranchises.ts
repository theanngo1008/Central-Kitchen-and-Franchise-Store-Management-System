import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminUserFranchisesApi } from "@/api/admin/userFranchises.api";
import { adminFranchisesApi } from "@/api/admin/franchises.api";
import { adminCentralKitchensApi } from "@/api/admin/centralKitchens.api";
import type { AdminUser } from "@/types/admin/user.types";
import type {
  AdminFranchise,
  WorkAssignmentType,
} from "@/types/admin/franchise.types";
import type { AdminCentralKitchen } from "@/types/admin/centralKitchen.types";

const mapAssignmentToSelectedWorkplaceId = (
  data: {
    assignmentType: WorkAssignmentType;
    franchiseId: number | null;
    centralKitchenId: number | null;
  } | null | undefined,
): number | null => {
  if (!data) return null;
  if (data.assignmentType === "CENTRAL_KITCHEN") return data.centralKitchenId;
  return data.franchiseId;
};

const getAllowedAssignmentType = (
  roleName?: string,
): WorkAssignmentType | null => {
  const r = (roleName || "").toLowerCase();

  if (r === "storestaff") return "FRANCHISE";
  if (r === "kitchenstaff") return "CENTRAL_KITCHEN";
  if (r === "supplycoordinator") return "CENTRAL_KITCHEN";

  return null;
};

export const useUserFranchises = (user: AdminUser | null, open: boolean) => {
  const queryClient = useQueryClient();
  const userId = user?.userId;
  const normalizedRole = (user?.roleName || "").toLowerCase();
  const isGlobalRole =
    normalizedRole === "admin" || normalizedRole === "manager";
  const allowedAssignmentType = useMemo(
    () => getAllowedAssignmentType(user?.roleName),
    [user?.roleName],
  );
  const isKitchenBasedRole = allowedAssignmentType === "CENTRAL_KITCHEN";
  const isStoreBasedRole = allowedAssignmentType === "FRANCHISE";

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(
    null,
  );
  const [initialFranchiseId, setInitialFranchiseId] = useState<number | null>(
    null,
  );

  const franchisesQuery = useQuery({
    queryKey: ["admin-franchises"],
    queryFn: () => adminFranchisesApi.list(),
    enabled: open && isStoreBasedRole,
  });

  const centralKitchensQuery = useQuery({
    queryKey: ["admin-central-kitchens"],
    queryFn: () => adminCentralKitchensApi.list(),
    enabled: open && isKitchenBasedRole,
  });

  const assignedQuery = useQuery({
    queryKey: ["admin-user-work-assignment", userId],
    queryFn: async () => {
      if (!userId) return null;
      return await adminUserFranchisesApi.getByUser(userId);
    },
    enabled: open && !!userId,
    retry: false,
  });

  useEffect(() => {
    if (!open) return;

    if (assignedQuery.isSuccess) {
      const selectedId = mapAssignmentToSelectedWorkplaceId(assignedQuery.data);
      setInitialFranchiseId(selectedId);
      setSelectedFranchiseId(selectedId);
      return;
    }

    if (assignedQuery.isError) {
      setInitialFranchiseId(null);
      setSelectedFranchiseId(null);
    }
  }, [
    open,
    assignedQuery.isSuccess,
    assignedQuery.isError,
    assignedQuery.data,
  ]);

  useEffect(() => {
    if (!open) return;

    if (
      isKitchenBasedRole &&
      !selectedFranchiseId &&
      !initialFranchiseId &&
      (centralKitchensQuery.data || []).length === 1
    ) {
      setSelectedFranchiseId(centralKitchensQuery.data![0].centralKitchenId);
    }
  }, [
    open,
    isKitchenBasedRole,
    selectedFranchiseId,
    initialFranchiseId,
    centralKitchensQuery.data,
  ]);

  const filteredFranchises = useMemo(() => {
    if (isStoreBasedRole) {
      return ((franchisesQuery.data || []) as AdminFranchise[]).filter(
        (f) => f.type === "STORE",
      );
    }

    return [];
  }, [franchisesQuery.data, isStoreBasedRole]);

  const filteredCentralKitchens = useMemo(() => {
    if (!isKitchenBasedRole) return [];
    return (centralKitchensQuery.data || []) as AdminCentralKitchen[];
  }, [centralKitchensQuery.data, isKitchenBasedRole]);

  const getFranchiseId = (f: AdminFranchise) => f.franchiseId;
  const getCentralKitchenId = (k: AdminCentralKitchen) => k.centralKitchenId;

  const isAllowedFranchise = (f: AdminFranchise) => {
    if (!isStoreBasedRole) return false;
    return f.type === "STORE";
  };

  const isAllowedCentralKitchen = (_k: AdminCentralKitchen) => {
    return isKitchenBasedRole;
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Missing userId");

      if (isGlobalRole) {
        throw new Error("Role này không cần gán cửa hàng / bếp");
      }

      if (!allowedAssignmentType) {
        throw new Error("Role này không có loại nơi làm việc hợp lệ");
      }

      if (!selectedFranchiseId) {
        throw new Error("Vui lòng chọn nơi làm việc hợp lệ");
      }

      if (initialFranchiseId && initialFranchiseId !== selectedFranchiseId) {
        await adminUserFranchisesApi.remove(userId);
      }

      if (allowedAssignmentType === "FRANCHISE") {
        const allFranchises = (franchisesQuery.data || []) as AdminFranchise[];
        const picked = allFranchises.find(
          (f) => f.franchiseId === selectedFranchiseId,
        );

        if (!picked) {
          throw new Error("Không tìm thấy cửa hàng đã chọn");
        }

        if (!isAllowedFranchise(picked)) {
          throw new Error(
            "Bạn đã chọn nơi làm việc không hợp lệ với vai trò của user",
          );
        }

        await adminUserFranchisesApi.assign({
          userId,
          assignmentType: "FRANCHISE",
          franchiseId: picked.franchiseId,
          centralKitchenId: null,
        });

        return { selectedFranchiseId };
      }

      const allCentralKitchens = (centralKitchensQuery.data ||
        []) as AdminCentralKitchen[];
      const picked = allCentralKitchens.find(
        (k) => k.centralKitchenId === selectedFranchiseId,
      );

      if (!picked) {
        throw new Error("Không tìm thấy bếp đã chọn");
      }

      if (!isAllowedCentralKitchen(picked)) {
        throw new Error(
          "Bạn đã chọn nơi làm việc không hợp lệ với vai trò của user",
        );
      }

      await adminUserFranchisesApi.assign({
        userId,
        assignmentType: "CENTRAL_KITCHEN",
        franchiseId: null,
        centralKitchenId: picked.centralKitchenId,
      });

      return { selectedFranchiseId };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-user-work-assignment", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-franchises"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-central-kitchens"],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Missing userId");
      await adminUserFranchisesApi.remove(userId);
    },
    onSuccess: async () => {
      setInitialFranchiseId(null);
      setSelectedFranchiseId(null);

      await queryClient.invalidateQueries({
        queryKey: ["admin-user-work-assignment", userId],
      });
    },
  });

  const loading =
    franchisesQuery.isLoading ||
    centralKitchensQuery.isLoading ||
    assignedQuery.isLoading;
  const submitting = submitMutation.isPending;
  const removing = removeMutation.isPending;

  return {
    franchises: (franchisesQuery.data || []) as AdminFranchise[],
    filteredFranchises,
    centralKitchens: (centralKitchensQuery.data || []) as AdminCentralKitchen[],
    filteredCentralKitchens,

    selectedFranchiseId,
    setSelectedFranchiseId,
    initialFranchiseId,

    allowedAssignmentType,
    isKitchenBasedRole,
    isStoreBasedRole,
    getFranchiseId,
    getCentralKitchenId,
    isAllowedFranchise,
    isAllowedCentralKitchen,

    loading,
    submitting,
    removing,

    refetch: async () => {
      await Promise.all([
        franchisesQuery.refetch(),
        centralKitchensQuery.refetch(),
        assignedQuery.refetch(),
      ]);
    },

    submit: async () => submitMutation.mutateAsync(),
    removeAssignment: async () => removeMutation.mutateAsync(),

    currentAssignment: assignedQuery.data ?? null,

    error: (franchisesQuery.error ||
      centralKitchensQuery.error ||
      assignedQuery.error ||
      submitMutation.error ||
      removeMutation.error) as unknown,
  };
};

export default useUserFranchises;