import { Container } from "../../container/features/containerTypes";
import { Warehouse } from "../../warehouse/features/warehouseTypes";
import { Item } from "../../item/features/itemTypes";
import { Business } from "../../business/features/businessTypes";
import { Account } from "../../account/features/accountTypes";
import { Invoice } from "../../invoice/features/invoiceTypes";

export interface Stock {
  id?: number;
  business?: Business;
  container?: Container;
  item?: Item;
  warehouse?: Warehouse;
  bank?: Account;
  invoice?: Invoice;

  businessId?: number;
  date: string;
  invoiceType?: string;
  invoiceId?: number;
  categoryId?: number;
  partyId?: number;
  itemId: number;
  movementType: string;
  warehouseId?: number | null;
  bankId?: number | null;
  quantity: number;

  unit?: string;
  invoiceRefNo?: string;
  stockRefNo?: string;
  containerId?: number | null;

  createdBy?: number;
  updatedBy?: number;
  createdByUser?: string;
  updatedByUser?: string;
}

export interface StockReport {
  containerId: number;
  itemId: number;
  containerNo?: string;
  container: Container;
  unit?: string;
  itemName?: string;
  item: Item;
  totalIn: number;
  totalOut: number;
  totalDamaged: number;
  purchaseValue: number;
  saleValue: number;
  itemRate: number;
  averageSaleRate: number;
  otherExpense: number;
  expenseDescription: string;
  wastedValue: number;
  profitLoss: number;
}

export interface StockState {
  data: Stock[];
  report: StockReport[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
