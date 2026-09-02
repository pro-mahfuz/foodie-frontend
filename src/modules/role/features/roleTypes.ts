import { Permission } from "../../permission/features/permissionTypes";

export interface Role {
  id: number;
  businessId: number;
  name: string;
  action: string;
  permissions: Permission[],
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleState {
  data: Role[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface SetRoleRequest {
  businessId: number;
  roleId?: number;
  name: string;
  permissionIds: number[]
}

export interface CreateRoleRequest {
  businessId: number;
  name: string;
  action: string;
  isActive: boolean;
  permissionIds: number[]
}