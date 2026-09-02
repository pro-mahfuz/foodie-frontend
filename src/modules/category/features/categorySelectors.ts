import { Category } from './categoryTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectCategoryStatus = (state: RootState) => state.category.status;
export const selectCategoryError = (state: RootState) => state.category.error;

export const selectAllCategory = (state: RootState): Category[] => state.category.data || [];
export const selectCategoryById = (id: number) => (state: RootState) => state.category.data.find(category => category.id === id);
