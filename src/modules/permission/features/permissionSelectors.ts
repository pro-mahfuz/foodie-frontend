import { PermissionGroup } from './permissionTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectAllPermissions = (state: RootState): PermissionGroup[] => state.permission.permissions;
export const selectPermissionStatus = (state: RootState) => state.permission.status;