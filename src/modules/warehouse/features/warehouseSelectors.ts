import { Warehouse } from './warehouseTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectWarehouseStatus = (state: RootState) => state.warehouse.status;
export const selectWarehouseError = (state: RootState) => state.warehouse.error;

export const selectAllWarehouse = (state: RootState): Warehouse[] => state.warehouse.data || [];

export const selectWarehouseById = (id: number) => (state: RootState) => state.warehouse.data.find(warehouse => warehouse.id === id);
