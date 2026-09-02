import { Item } from './itemTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from '@reduxjs/toolkit';

export const selectItemStatus = (state: RootState) => state.item.status;
export const selectItemError = (state: RootState) => state.item.error;

export const selectAllItem = (state: RootState): Item[] => state.item.data || [];

//export const selectAllItemByBusiness = (businessId: number) => (state: RootState): Item[] => state.item.data.filter(item => item.businessId === businessId) || [];

export const selectAllItemByBusiness = (businessId: number) =>
  createSelector(
    (state: RootState) => state.item.data,
    (items) => items.filter(item => Number(item.businessId) === Number(businessId))
  );

export const selectItemById = (id: number) => (state: RootState) => state.item.data.find(item => item.id === id);


