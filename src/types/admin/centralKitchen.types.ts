export type CentralKitchenStatus = "ACTIVE" | "INACTIVE";

export interface AdminCentralKitchen {
  centralKitchenId: number;
  name: string;
  status: CentralKitchenStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  franchiseCount?: number;
  activeFranchiseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCentralKitchenPayload {
  name: string;
  status: CentralKitchenStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface UpdateCentralKitchenPayload {
  name: string;
  status: CentralKitchenStatus;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface CentralKitchenOption {
  value: number;
  label: string;
}