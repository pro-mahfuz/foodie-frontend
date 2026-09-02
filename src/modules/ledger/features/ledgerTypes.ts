import { Party } from "../../party/features/partyTypes.ts";
import { Account } from "../../account/features/accountTypes.ts";
import { Invoice } from "../../invoice/features/invoiceTypes.ts";
import { Payment } from "../../payment/features/paymentTypes.ts";
import { Stock } from "../../stock/features/stockTypes.ts";

export interface Category {
  id: number;
  name: string;
  isAction: boolean;
}

export interface Ledger {
  id?: number;
  businessId: number;              
  categoryId: number;         
  transactionType: string;
  partyId: number;           
  date: string;  
  invoiceId?: number; 
  invoice?: Invoice;
  paymentId?: number; 
  payment?: Payment;
  stockId?: number; 
  stock?: Stock;
  paymentRefNo?: string;
  invoiceRefNo?: string;
  stockRefNo?: string;      
  description: string; 
  currency: string;
  stockCurrency: string;
  debit: number;
  credit: number;
  debitQty: number;
  creditQty: number;
  balance: number;
  party?: Party;
  bank?: Account;
  bankId?: number;
  category?: Category;
  createdBy?: number;
  updatedBy?: number;
  createdByUserName?: string;
  updatedByUserName?: string;
}

export interface LedgerState {
  data: Ledger[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}