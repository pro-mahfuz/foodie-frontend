import { Category } from "../../category/features/categoryTypes";
import { Party } from "../../party/features/partyTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { Container } from "../../container/features/containerTypes.ts";
import { User } from "../../user/features/userTypes.ts";
import { Business } from "../../business/features/businessTypes.ts";

type AdvanceSummary = {
  currency: string;
  advanceInSum: number;
  advanceOutSum: number;
};
// Invoice interface
export interface Invoice {
  id?: number; 
  invoiceRefId?: number;
  vatInvoiceRefNo?: number;
  businessId?: number;   
  business?: Business;            
  containerId?: number | null;
  categoryId?: number | null;
  container?: Container;
  prefix?: string;
  invoiceNo?: string;
  invoiceType?: string;
  partyId: number | string;
  party?: Party;
  date: string;
  note: string;
  totalAmount: number;
  totalPaidAmount?: number;
  discount?: number | null;
  totalDiscount?: number | null;
  isVat?: boolean;
  isFullPaid?: boolean;
  bankId?: number;
  vatPercentage?: number;
  grandTotal?: number;
  vatAmount?: number;
  paidTotal?: number | null;
  category?: Category;
  items: Item[]; 
  currency: string;
  netStock?: number;
  paymentInSum?: number;
  paymentOutSum?: number;
  customerName?: string;
  advancesArray?: AdvanceSummary[];
  totalBill?: number;
  totalPaid?: number;
  totalDue?: number;
  system: number;
  createdBy?: number;
  updatedBy?: number;
  createdByUser?: User;
  updatedByUser?: User;
  ounceRate?: number | undefined;
  ounceRateGram?: number | undefined;
  discountTotal?: number;
}

export interface ProfitLoss {
  date: string;
  containerNo?: string;
  itemName: string;
  itemUnit: string;
  totalPurchaseAmount: number;
  totalPurchaseQty: number;
  avgPurchaseRate?: number;
  saleAmount: number;
  saleQty: number;
  avgSaleRate?: number;
  profitLoss: number;
  currency: string;
  previousProfit: number;
  currentProfit: number;
  totalProfit: number;
}

export interface SaleCashReport {
  date: string;
  previousDue: number;
  saleAmount: number;
  cashReceived: number;
  dueAmount: number;
}

export interface CustomerCashReport {
  date: string;
  customer: string;
  totalSale: number;
  totalPaid: number;
  totalDue: number;
  totalDiscount: number;
}

export interface InvoiceState {
  data: Invoice[];
  invoiceData: Invoice | null;
  dataPaginated: Invoice[];
  saleReport: Invoice[];
  purchaseReport: Invoice[];
  saleContainerReport: Item[];
  saleCashReport: SaleCashReport[];
  billReport: Invoice[];
  salePaymentReport: CustomerCashReport[];
  profitLossReport: ProfitLoss[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


