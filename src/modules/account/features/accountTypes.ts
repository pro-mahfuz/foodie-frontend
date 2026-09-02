export interface Account {
  id?: number;
  businessId?: number;
  accountName: string;
  accountNo: string;
  address: string;
  currency: string;
  openingBalance: number;
  stockInSum?: number;
  stockOutSum?: number;
  paymentInSum?: number;
  paymentOutSum?: number;
  isActive: boolean;
}

export interface BalanceReport {
  id?: number;
  businessId?: number;
  accountName: string;
  accountNo: string;
  address: string;
  isActive: boolean;
  currency: string;
  openingBalance: number;
  stockInSum?: number;
  stockOutSum?: number;
  paymentInSum?: number;
  paymentOutSum?: number;
  capitalInSum?: number;
  capitalOutSum?: number;
  advanceInSum?: number;
  advanceOutSum?: number;
  expenseOutSum?: number;
  containerExpenseOutSum?: number;
  billOutSum?: number;
}

export interface AssetReport {
  id?: number;
  businessId?: number;
  currency: string;
  openingBalance: number;
  capitalInSum?: number;
  capitalOutSum?: number;
  expenseOutSum?: number;
  containerExpenseOutSum?: number;
}

export interface AccountState {
  data: Account[];
  balanceReport: BalanceReport[],
  assetReport: AssetReport[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}