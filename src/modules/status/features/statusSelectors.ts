import { Status } from './statusTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectStatusStatus = (state: RootState) => state.status.status;
export const selectStatusError = (state: RootState) => state.status.error;

export const selectAllStatus = (state: RootState): Status[] => state.status.data || [];

export const selectAllStatusByBusiness = (businessId: number) => (state: RootState): Status[] => state.status.data.filter(status => status.businessId === businessId) || [];

export const selectStatusById = (id: number) => (state: RootState) => state.status.data.find(status => status.id === id);

export const selectAllStatusByType = (
  businessId: number,
  group: string
) =>
  createSelector([selectAllStatus], (statuses: Status[]) => {
   
    if ( group === "all") {
      return statuses.filter((status) => status.businessId === businessId && status.group !== "expense");
    }
    return statuses.filter((status) => status.businessId === businessId && status.group === group);
  });


