export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  status: UserStatus;
  roleId: number;
  roleName: string;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  roleId: number;

  assignmentType?: WorkAssignmentType;
  workplaceId?: number | null;
}

export interface UpdateUserPayload {
  roleId: number;
  status: UserStatus;
}
