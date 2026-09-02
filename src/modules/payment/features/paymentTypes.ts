
import { Category } from "../../category/features/categoryTypes";
import { Party } from "../../party/features/partyTypes";
import { Invoice } from "../../invoice/features/invoiceTypes";
import { Account } from "../../account/features/accountTypes";
import { Container } from "../../container/features/containerTypes";


export type OptionType = {
  label: string;
  value: string;
};

export const paymentOptions:  OptionType[] = [
    { value: "payment_in", label: "Payment (Received)" },
    { value: "payment_out", label: "Payment (Make)" },

    { value: "discount_sale", label: "Discount (Sale)" },
    { value: "discount_purchase", label: "Discount (Purchase)" },
    { value: "premium_received", label: "Premium (Received)" },
    { value: "premium_paid", label: "Premium (Paid)" },
    { value: "deposit", label: "Deposit" },
    { value: "withdraw", label: "Withdraw" },

    { value: "advance_received", label: "Advance Received" },
    { value: "advance_received_deduct", label: "Advance Received (Deduct)"},
    { value: "advance_payment", label: "Advance Payment" },
    { value: "advance_payment_deduct", label: "Advance Payment (Deduct)"},

    { value: "payable", label: "Payable" },
    { value: "receivable", label: "Receivable"},

    { value: "bill_out", label: "Bill Payment" },
    { value: "capital_in", label: "Capital In" },
    { value: "capital_out", label: "Capital Out"},
];

export const expenseOptions:  OptionType[] = [
  { value: "container_expense", label: "For Container" },
  { value: "office_expense", label: "For Office" },
];

export  const paymentMethodOptions:  OptionType[] = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank" },
];



export interface Payment {
  id?: number;   
  businessId?: number;        
  invoiceId?: number | null;
  categoryId?: number | null;
  invoiceRefId?: string;
  containerId?: number | null;
  container?: Container;
  partyId?: number | null;
  paymentRefNo?: string;
  invoiceRefNo?: string;
  vatInvoiceRefNo?: string;
  paymentType: string;
  paymentDate: string;
  note?: string;
  amountPaid: number;
  bankId?: number | null;
  bank?: Account;
  paymentMethod?: string;
  paymentDetails?: string;
  currency: string;
  category?: Category;
  invoice?: Invoice;
  party?: Party;
  system: number;
  createdBy?: number;
  updatedBy?: number;
  createdByUser?: string;
  updatedByUser?: string;
}

export interface PaymentState {
  data: Payment[];
  dataPaginated: Payment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}