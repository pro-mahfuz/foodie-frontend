import { Role } from './roleTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectRoleStatus = (state: RootState) => state.role.status;
export const selectAllRoles = (state: RootState): Role[] => state.role.data;
export const selectRoles = (businessId: number) => (state: RootState) => 
  businessId === 0 ? state.role.data :
  businessId > 0 ? state.role.data.filter(role => role.businessId === businessId) : 
  [];