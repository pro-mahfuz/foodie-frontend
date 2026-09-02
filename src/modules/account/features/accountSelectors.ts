import { Account, BalanceReport, AssetReport } from './accountTypes.ts';
import { RootState } from "../../../store/store.ts";

export const selectAccountStatus = (state: RootState) => state.bank.status;
export const selectAccountError = (state: RootState) => state.bank.error;

export const selectAllAccount = (state: RootState): Account[] => state.bank.data || [];

export const selectAccountById = (id: number) => (state: RootState) => state.bank.data.find(bank => bank.id === id);
export const selectAllAccountByBusiness = (businessId: number) => (state: RootState) => state.bank.data.filter(bank => bank.businessId === businessId);

export const selectBalanceStatement = (state: RootState): BalanceReport[] => state.bank.balanceReport || [];

export const selectAssetStatement = (state: RootState): AssetReport[] => state.bank.assetReport || [];
