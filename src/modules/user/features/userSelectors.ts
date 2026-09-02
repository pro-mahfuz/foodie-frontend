import { User } from './userTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;
export const selectAllUsers = (state: RootState): User[] => state.user.data;
export const selectUsers = (businessId: number) => (state: RootState) => 
  businessId === 0 ? state.user.data :
  businessId > 0 ? state.user.data.filter(user => user.businessId === businessId) : [];


export const selectUserById = (id: number) => (state: RootState) =>
  state.user.data.find(user => user.id === id);
export const selectUserByEmail = (email: string) => (state: RootState) =>
  state.user.data.find(user => user.email.toLowerCase() === email.toLowerCase());


