import { Ledger } from './ledgerTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectLedgerStatus = (state: RootState) => state.ledger.status;
export const selectLedgerError = (state: RootState) => state.ledger.error;
export const selectAllLedger = (state: RootState): Ledger[] => state.ledger.data || [];

export const selectLedgers = (
  businessId: number = 0,
  partyId: number = 0,
  categoryId: number = 0
) => {
  return createSelector([selectAllLedger], (ledgers) => {
    let filteredLedgers = ledgers.filter((l) => {
      if (businessId > 0 && l.businessId !== businessId) return false;
      if (partyId > 0 && l.partyId !== partyId) return false;
      if (categoryId > 0 && l.categoryId !== categoryId) return false;
      return true;
    });

    // Step 2: Sort by date (optional but important for running balance)
    filteredLedgers = filteredLedgers.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return filteredLedgers;
  });
};


export const selectAccountLedgers = (
  businessId: number = 0,
  partyId: number = 0,
  categoryId: number = 0,
  bankId: number = 0
) => {
  return createSelector([selectAllLedger], (ledgers) => {
    // Step 1: Filter ledgers
    const filteredLedgers = ledgers
      .filter((l) => {
        const type = l.transactionType?.toLowerCase() ?? "";

        // Exclude purchase and sale transactions
        if (type === "purchase" || type === "sale") return false;

        // Apply filters only if values are provided
        if (businessId > 0 && l.businessId !== businessId) return false;
        if (partyId > 0 && l.partyId !== partyId) return false;
        if (categoryId > 0 && l.categoryId !== categoryId) return false;
        if (bankId > 0 && l.bankId !== bankId) return false;

        return true;
      })

    // Step 2: Compute running balance
    const withBalance = filteredLedgers.map((l) => {
      const debit = Number(l.debit || 0);
      const credit = Number(l.credit || 0);
      const debitQty = Number(l.debitQty || 0);
      const creditQty = Number(l.creditQty || 0);

      // Increase or decrease balance
      const runningBalance = (credit + creditQty) - (debit + debitQty);

      return {
        ...l,
        runningBalance,
      };
    });

    return withBalance;
  });
};





const SALE_TYPES = [
  "sale", "wholesale_sale", "fix_sale", "unfix_sale", "stock_out", "payment_in", 
  "capital_in", "capital_out", "advance_received", "advance_payment_deduct", "advance_payment", 
  "advance_received_deduct", "discount_sale"
];
const PURCHASE_TYPES = [
  "purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "stock_in", "payment_out", 
  "capital_in", "capital_out", "advance_received", "advance_payment_deduct", "advance_payment", 
  "advance_received_deduct", "discount_purchase"
];
const All_TYPES = [
  "purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "stock_in", "payment_out", 
  "sale", "wholesale_sale", "fix_sale", "unfix_sale", "stock_out", "payment_in", "capital_in", "capital_out", 
  "advance_received", "advance_payment_deduct", "advance_payment", "advance_received_deduct", "discount_sale", 
  "discount_purchase", "premium_received", "premium_paid", "deposit", "withdraw"
];

export const selectLedgerByPartyType = (
  businessId: number = 0,
  ledgerType?: string,
  partyId?: number
) =>
  createSelector([selectAllLedger], (ledgers) => {
    // Choose allowed transaction types
    const typeList = ledgerType === "sale" ? SALE_TYPES : ledgerType === "purchase" ? PURCHASE_TYPES : All_TYPES;

    const typeListNormalized = typeList.map((t) => t.toLowerCase());

    // Step 1: Apply filters
    let filteredLedgers = ledgers.filter((ledger) => {
      const txType = ledger.transactionType?.toLowerCase() ?? "";

      // Must match allowed type list
      if (!typeListNormalized.includes(txType)) return false;

      // Filter by business
      if (businessId > 0 && ledger.businessId !== businessId) return false;

      // Filter by party if provided
      if (partyId && Number(partyId) > 0 && Number(ledger.partyId) !== Number(partyId))
        return false;

      return true;
    });

    // Step 2: Sort by date (optional but important for running balance)
    filteredLedgers = filteredLedgers.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Step 3: Calculate cumulative running balance
    const withBalance = filteredLedgers.map((l) => {
      const debit = Number(l.debit || 0);
      const credit = Number(l.credit || 0);
      const debitQty = Number(l.debitQty || 0);
      const creditQty = Number(l.creditQty || 0);

      const runningBalance = (credit + creditQty) - (debit + debitQty);

      return {
        ...l,
        runningBalance,
      };
    });

    return withBalance;
  });

