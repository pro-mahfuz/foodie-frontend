import { Payment } from './paymentTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectPaymentStatus = (state: RootState) => state.payment.status;
export const selectPaymentError = (state: RootState) => state.payment.error;

export const selectAllPayment = (state: RootState): Payment[] => state.payment.data || [];

export const selectTotalPages = (state: RootState) => state.payment.totalPages;

export const selectAllPayments = (state: RootState): Payment[] =>
  state.payment.data.filter(p => p.system === 1) || [];

export const selectAllPaymentPaginated = (state: RootState): Payment[] =>
  state.payment.dataPaginated || [];

export const selectInPayments = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in" && p.system === 1
  ) || [];

export const selectAllPayments_Sys2 = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in" && (p.system === 2 || p.invoice?.isVat === true)
  ) || [];

export const selectAllSalePayments = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "payment_in"
  ) || [];

export const selectSaleCollectionReport = (fromDate?: string, toDate?: string) =>
  createSelector([selectAllPayment], (payments: Payment[]) => {
    // Cash collection is the System 1 sales workspace report.
    const incomingPayments = payments.filter(
      (p) => p.paymentType === "payment_in" && p.system === 1
    );

    // --- Default to current month if no date is passed ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current ---
    const previous = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date < from;
    });

    const current = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date >= from && date <= to;
    });

    // --- Sort current by ascending date ---
    const sortedCurrent = [...current].sort((a, b) => {
      const da = new Date(a?.paymentDate ?? "").getTime();
      const db = new Date(b?.paymentDate ?? "").getTime();
      return da - db;
    });

    // --- Helper: sum by currency and return array ---
    const sumByCurrency = (list: Payment[]) => {
      const grouped: Record<string, number> = {};

      list.forEach((p) => {
        const currency = p.currency || "N/A";
        const amount = Number(p.amountPaid) || 0;
        grouped[currency] = (grouped[currency] || 0) + amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    // --- Merge two totals ---
    const mergeTotals = (prev: { currency: string; amount: number }[], curr: { currency: string; amount: number }[]) => {
      const grouped: Record<string, number> = {};

      [...prev, ...curr].forEach((entry) => {
        grouped[entry.currency] = (grouped[entry.currency] || 0) + entry.amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    const previousTotal = sumByCurrency(previous);
    const currentTotal = sumByCurrency(current);
    const total = mergeTotals(currentTotal, previousTotal);

    return {
      payments: sortedCurrent,
      previousTotal,
      currentTotal,
      total,
    };
  });

export const selectPurchaseCashPaymentReport = (fromDate?: string, toDate?: string) =>
  createSelector([selectAllPayment], (payments: Payment[]) => {
    const incomingPayments = payments.filter((p) => p.paymentType === "payment_out");

    // --- Default to current month if no date is passed ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // first day of month
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current ---
    const previous = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date < from;
    });

    const current = incomingPayments.filter((p) => {
      const date = new Date(p?.paymentDate ?? "");
      return !isNaN(date.getTime()) && date >= from && date <= to;
    });

    // --- Sort current by ascending date ---
    const sortedCurrent = [...current].sort((a, b) => {
      const da = new Date(a?.paymentDate ?? "").getTime();
      const db = new Date(b?.paymentDate ?? "").getTime();
      return da - db;
    });

    // --- Helper: sum by currency and return array ---
    const sumByCurrency = (list: Payment[]) => {
      const grouped: Record<string, number> = {};

      list.forEach((p) => {
        const currency = p.currency || "N/A";
        const amount = Number(p.amountPaid) || 0;
        grouped[currency] = (grouped[currency] || 0) + amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    // --- Merge two totals ---
    const mergeTotals = (prev: { currency: string; amount: number }[], curr: { currency: string; amount: number }[]) => {
      const grouped: Record<string, number> = {};

      [...prev, ...curr].forEach((entry) => {
        grouped[entry.currency] = (grouped[entry.currency] || 0) + entry.amount;
      });

      return Object.entries(grouped).map(([currency, amount]) => ({
        currency,
        amount,
      }));
    };

    const previousTotal = sumByCurrency(previous);
    const currentTotal = sumByCurrency(current);
    const total = mergeTotals(currentTotal, previousTotal);

    return {
      payments: sortedCurrent,
      previousTotal,
      currentTotal,
      total,
    };
  });





export const selectAllExpense = (state: RootState): Payment[] =>
  state.payment.data.filter(
    p => p.paymentType === "container_expense" || p.paymentType === "office_expense"
  ) || [];

export const selectAllContainerExpense = (containerId?: number) => (state: RootState): Payment[] =>
  containerId ? state.payment.data.filter( p => p.paymentType === "container_expense" && p.containerId === containerId ) 
  : state.payment.data.filter( p => p.paymentType === "container_expense" ) || [];

export const selectAllOfficeExpense = (fromDate?: string, toDate?: string) =>
  createSelector(
    (state: RootState) => state.payment.data ?? [],
    (payments) => {
      const filteredPayments = payments.filter(
        (p) => p.paymentType === "office_expense"
      );

      if (!filteredPayments.length) {
        return {
          expenses: [],
          totalsByCurrency: [] as {
            currency: string;
            previousTotal: number;
            currentTotal: number;
            overallTotal: number;
          }[],
        };
      }

      // --- Defaults ---
      const now = new Date();
      const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const from = fromDate ? new Date(fromDate) : defaultFrom;
      from.setHours(0, 0, 0, 0);

      const to = toDate ? new Date(toDate) : defaultTo;
      to.setHours(23, 59, 59, 999);

      const hasDateFilter = !!fromDate || !!toDate;

      const totalsByCurrency: Record<
        string,
        {
          currency: string;
          previousTotal: number;
          currentTotal: number;
          overallTotal: number;
        }
      > = {};

      const expenses: typeof filteredPayments = [];

      for (const p of filteredPayments) {
        const timestamp = Date.parse(p.paymentDate);
        if (isNaN(timestamp)) continue;
        const paymentDate = new Date(timestamp);
        const currency = p.currency || "Unknown";
        const amount = Number(p.amountPaid ?? 0);

        if (!totalsByCurrency[currency]) {
          totalsByCurrency[currency] = {
            currency,
            previousTotal: 0,
            currentTotal: 0,
            overallTotal: 0,
          };
        }

        // --- If no date filter: count everything as current ---
        if (!hasDateFilter) {
          totalsByCurrency[currency].currentTotal += amount;
          totalsByCurrency[currency].overallTotal += amount;
          expenses.push(p);
          continue;
        }

        // --- Otherwise: apply date-based logic ---
        if (paymentDate < from) {
          totalsByCurrency[currency].previousTotal += amount;
          totalsByCurrency[currency].overallTotal += amount;
        } else if (paymentDate >= from && paymentDate <= to) {
          totalsByCurrency[currency].currentTotal += amount;
          totalsByCurrency[currency].overallTotal += amount;
          expenses.push(p);
        } else {
          // Future payments after 'to'
          totalsByCurrency[currency].overallTotal += amount;
        }
      }

      return {
        expenses,
        totalsByCurrency: Object.values(totalsByCurrency),
      };
    }
  );







export const selectPaymentById = (id: number) => (state: RootState) => state.payment.data.find(payment => payment.id === id);

export const selectTotalPaymentByDate = (date: string) => (state: RootState) => {
  const payments = state.payment.data.filter(
    (payment) => payment.paymentDate.split("T")[0] === date
  );

  const paidSum = payments.reduce(
    (acc, p) => acc + Number(p.amountPaid ?? 0),
    0
  );

  return {
    date,
    paidSum,
  };
};




