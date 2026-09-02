export interface Permission {
  id: string;
  name: string;
  action: string;
  group: string;
}

export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

export interface PermissionState {
  permissions: PermissionGroup[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}