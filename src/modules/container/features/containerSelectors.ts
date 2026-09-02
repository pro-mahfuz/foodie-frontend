
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectContainerStatus = (state: RootState) => state.container.status;
export const selectContainerError = (state: RootState) => state.container.error;

// Used by management lists that must show both active and inactive records.
export const selectAllContainersIncludingInactive = (state: RootState) => state.container.data;

export const selectAllContainer = createSelector(
  [(state: RootState) => state.container.data],
  (data) => data.filter((container) => container.isActive)
);


export const selectContainerById = (id: number) => (state: RootState) => state.container.data.find(container => container.id === id);




