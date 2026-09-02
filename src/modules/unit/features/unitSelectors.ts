import { Unit } from './unitTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectUnitStatus = (state: RootState) => state.unit.status;
export const selectUnitError = (state: RootState) => state.unit.error;

export const selectAllUnit = (state: RootState): Unit[] => state.unit.data || [];


export const selectUnitById = (id: number) => (state: RootState) => state.unit.data.find(unit => unit.id === id);

export const selectAllUnitByBusiness = (
  businessId: number
) =>
  createSelector([selectAllUnit], (units: Unit[]) => {
    return units.filter((unit) => Number(unit.businessId) === Number(businessId));
  });


