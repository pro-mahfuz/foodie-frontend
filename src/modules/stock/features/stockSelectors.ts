import { Stock, StockReport } from './stockTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectStockStatus = (state: RootState) => state.stock.status;
export const selectStockError = (state: RootState) => state.stock.error;

export const selectAllStock = (state: RootState): Stock[] => state.stock.data || [];

export const selectStockReport = (state: RootState): StockReport[] => state.stock.report || [];

export const selectStockById = (id: number) => (state: RootState) => state.stock.data.find(stock => stock.id === id);


