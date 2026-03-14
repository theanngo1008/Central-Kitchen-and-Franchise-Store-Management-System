export type FranchiseType = "STORE";
export type FranchiseStatus = "ACTIVE" | "INACTIVE";

export interface AdminFranchise {
  franchiseId: number;
  centralKitchenId: number;
  centralKitchenName: string;
  name: string;
  type: FranchiseType;
  status: FranchiseStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFranchisePayload {
  centralKitchenId: number;
  name: string;
  type: FranchiseType;
  status: FranchiseStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface UpdateFranchisePayload {
  centralKitchenId: number;
  name: string;
  type: FranchiseType;
  status: FranchiseStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface CentralKitchenOption {
  value: number;
  label: string;
}

export interface CentralKitchenSummaryItem {
  centralKitchenId: number;
  centralKitchenName: string;
  storesCount: number;
}

// ================= WORK ASSIGNMENT =================

export type WorkAssignmentType = "FRANCHISE" | "CENTRAL_KITCHEN";

export interface UserWorkAssignment {
  userId: number;
  assignmentType: WorkAssignmentType;
  franchiseId: number | null;
  centralKitchenId: number | null;
  assignedAt: string;
}

export interface AssignedUserItem {
  userId: number;
  username: string;
  email: string;
  roleName: string;
  assignmentType: WorkAssignmentType;
  franchiseId: number | null;
  centralKitchenId: number | null;
  assignedAt: string;
}