import { Business } from './businessTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectBusinessStatus = (state: RootState) => state.business.status;
export const selectBusinessError = (state: RootState) => state.business.error;

export const selectAllBusiness = (state: RootState): Business[] => state.business.data || [];

export const selectBusinessById = (id: number) => (state: RootState) => state.business.data.find(business => business.id === id);