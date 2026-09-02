import { Invoice, ProfitLoss, CustomerCashReport } from './invoiceTypes.ts';
import { RootState } from "../../../store/store.ts";
import { createSelector } from 'reselect';

export const selectInvoiceStatus = (state: RootState) => state.invoice.status;
export const selectInvoiceError = (state: RootState) => state.invoice.error;

export const selectAllInvoice = (state: RootState): Invoice[] => state.invoice.data || [];

export const selectInvoice = (state: RootState): Invoice | null => state.invoice.invoiceData;

export const selectInvoiceAll = (state: RootState): Invoice[] => state.invoice.data || [];

export const selectAllPurchaseInvoice = (state: RootState): Invoice[] => state.invoice.purchaseReport || [];
export const selectAllSaleInvoice = (state: RootState): Invoice[] => state.invoice.saleReport || [];

export const selectAllBillReport = (state: RootState): Invoice[] => state.invoice.billReport || [];
export const selectAllSaleReport = (state: RootState): Invoice[] => state.invoice.saleReport || [];

export const selectAllProfitLossReport = (state: RootState): ProfitLoss[] => state.invoice.profitLossReport || [];

export const selectDailyProfitLossReport = (state: RootState): ProfitLoss[] => state.invoice.profitLossReport || [];

export const selectDailyProfitLossReportByDate = (fromDate?: string, toDate?: string) =>
  createSelector(
    [(state: RootState) => state.invoice.profitLossReport || []],
    (report: ProfitLoss[]) => {
      const now = new Date();

      // Default: current month
      const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const from = fromDate ? new Date(fromDate) : defaultFrom;
      const to = toDate ? new Date(toDate) : defaultTo;

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      const previousProfitMap: Record<string, number> = {};
      const currentProfitMap: Record<string, number> = {};
      const totalProfitMap: Record<string, number> = {};

      const filteredData: ProfitLoss[] = [];

      for (const r of report) {
        const date = new Date(r.date);
        if (isNaN(date.getTime())) continue;

        const currency = r.currency || "Unknown";
        const profit = r.profitLoss || 0;

        if (date < from) {
          previousProfitMap[currency] = (previousProfitMap[currency] || 0) + profit;
        } else if (date >= from && date <= to) {
          currentProfitMap[currency] = (currentProfitMap[currency] || 0) + profit;
          filteredData.push(r);
        }
      }

      // Combine previous + current for total
      const allCurrencies = new Set([
        ...Object.keys(previousProfitMap),
        ...Object.keys(currentProfitMap),
      ]);

      allCurrencies.forEach((currency) => {
        totalProfitMap[currency] =
          (previousProfitMap[currency] || 0) + (currentProfitMap[currency] || 0);
      });

      // Convert maps to desired array format
      const previousProfit = Object.entries(previousProfitMap).map(([currency, amount]) => ({
        currency,
        amount,
      }));

      const currentProfit = Object.entries(currentProfitMap).map(([currency, amount]) => ({
        currency,
        amount,
      }));

      const totalProfit = Object.entries(totalProfitMap).map(([currency, amount]) => ({
        currency,
        amount,
      }));

      return {
        data: filteredData,
        previousProfit,
        currentProfit,
        totalProfit,
      };
    }
);

export const selectCustomerOutstandingReport = (state: RootState): CustomerCashReport[] => state.invoice.salePaymentReport || [];

export const selectPurchaseReport = ( fromDate?: string, toDate?: string, containerNo?: string, partyId?: number) =>
  createSelector([selectAllPurchaseInvoice], (invoices: Invoice[]) => {
    // --- If searching only by partyId, skip date filter entirely ---
    const onlyPartySearch =
      Number(partyId) > 0 && !fromDate && !toDate && !containerNo;

    // --- Default to current month if not provided ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of month
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of month

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current period ---
    const previous = invoices.filter((inv) => {
      if (onlyPartySearch) return false; // no "previous" if showing all
      const date = new Date(inv?.date ?? "");
      return !isNaN(date.getTime()) && date < from;
    });

    const current = invoices.filter((inv) => {
      const date = new Date(inv?.date ?? "");
      if (isNaN(date.getTime())) return false;

      const dateMatch = onlyPartySearch
        ? true // ignore date filters
        : date >= from && date <= to;

      const containerMatch = containerNo
        ? inv.items?.some(
            (item) =>
              item.container?.containerNo?.toLowerCase() ===
              containerNo.toLowerCase()
          )
        : true;

      const partyMatch = Number(partyId) > 0 ? inv.partyId === partyId : true;

      return dateMatch && containerMatch && partyMatch;
    });

    // --- Totals helper ---
    const sumTotals = (list: Invoice[]) =>
      list.reduce(
        (acc, inv) => {
          const net = Number(inv.totalAmount) || 0;
          const vat =
            inv.isVat === true
              ? net * (Number(inv.vatPercentage) || 0) / 100
              : 0;
          const grand = net + vat;
          const paid = Number(inv.paymentOutSum) || 0;

          acc.netTotal += net;
          acc.vatTotal += vat;
          acc.grandTotal += grand;
          acc.paidTotal += paid;
          acc.dueTotal += grand - paid;

          return acc;
        },
        { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 }
      );

    return {
      invoices: current,
      currentTotals: sumTotals(current),
      previousTotals: sumTotals(previous),
    };
  }
);

export const selectSaleReport = (
  fromDate?: string,
  toDate?: string,
  containerNo?: string,
  partyId?: number
) =>
  createSelector([selectAllSaleInvoice], (invoices: Invoice[]) => {
    const hasParty = Number(partyId) > 0;
    const hasContainer = !!containerNo;

    // 🔹 If searching ONLY by party
    const onlyPartySearch =
      hasParty && !fromDate && !toDate && !containerNo;

    // 🔹 Date range (default = current month)
    const now = new Date();
    const from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // 🔹 Helpers
    const isValidDate = (d: Date) => !isNaN(d.getTime());
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // 🔹 Previous period
    const previous = invoices.filter(inv => {
      if (onlyPartySearch || inv.system !== 1) return false;

      const date = new Date(inv.date ?? "");
      return isValidDate(date) && date < from;
    });

    // 🔹 Current period
    const current = invoices.filter(inv => {
      if (inv.system !== 1) return false;

      const date = new Date(inv.date ?? "");
      if (!isValidDate(date)) return false;

      const dateMatch = onlyPartySearch
        ? true
        : date >= from && date <= to;

      const containerMatch = hasContainer
        ? inv.items?.some(
            item =>
              item.container?.containerNo?.toLowerCase() ===
              containerNo!.toLowerCase()
          )
        : true;

      const partyMatch = hasParty
        ? inv.partyId === partyId
        : true;

      return dateMatch && containerMatch && partyMatch;
    });

    // 🔹 Totals
    const sumTotals = (list: Invoice[]) =>
      list.reduce(
        (acc, inv) => {
          const net = round2(Number(inv.totalAmount) || 0);

          const vat = inv.isVat
            ? round2((net * Number(inv.vatPercentage || 0)) / 100)
            : 0;

          const grand = round2(net + vat);
          const discount = round2(Number(inv.discount) || 0);
          const netAfterDis = round2(grand - discount);
          const paid = round2(Number(inv.paymentInSum) || 0);
          const due = round2(netAfterDis - paid);

          acc.netTotal += net;
          acc.vatTotal += vat;
          acc.grandTotal += grand;
          acc.discountTotal += discount;
          acc.netAfterDisTotal += netAfterDis;
          acc.paidTotal += paid;
          acc.dueTotal += due;

          return acc;
        },
        {
          netTotal: 0,
          vatTotal: 0,
          grandTotal: 0,
          discountTotal: 0,
          netAfterDisTotal: 0,
          paidTotal: 0,
          dueTotal: 0,
        }
      );

    return {
      invoices: current,
      currentTotals: sumTotals(current),
      previousTotals: sumTotals(previous),
    };
  });


export const selectSaleStatement = (fromDate?: string, toDate?: string, partyId?: number) => createSelector([selectAllSaleInvoice], (invoices: Invoice[]) => {
    const onlyPartySearch = Number(partyId) > 0 && !fromDate && !toDate;

    const now = new Date();

    // Parse year-month safely
    const parseYearMonth = (ym?: string, isEnd?: boolean) => {
      if (!ym) return null;
      const [year, month] = ym.split("-").map(Number);
      if (isNaN(year) || isNaN(month)) return null;

      return isEnd
        ? new Date(year, month, 0, 23, 59, 59, 999) // last day of month
        : new Date(year, month - 1, 1, 0, 0, 0, 0); // first day of month
    };

    const from =
      parseYearMonth(fromDate) ??
      new Date(now.getFullYear(), now.getMonth(), 1);

    const to =
      parseYearMonth(toDate, true) ??
      new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const current = invoices.filter((inv) => {
      const date = new Date(inv?.date ?? "");
      if (isNaN(date.getTime())) return false;

      const dateMatch = onlyPartySearch
        ? true
        : date >= from && date <= to && inv.system === 1;

      const partyMatch =
        Number(partyId) > 0 && inv.system === 1 ? inv.partyId === partyId : true;

      return dateMatch && partyMatch;
    });

    const sumTotals = (list: Invoice[]) =>
      list.reduce(
        (acc, inv) => {
          const net = Number(inv.totalAmount) || 0;
          const vat =
            inv.isVat === true
              ? (net * (Number(inv.vatPercentage) || 0)) / 100
              : 0;
          const grand = net + vat;
          const paid = Number(inv.paymentInSum) || 0;

          acc.netTotal += net;
          acc.vatTotal += vat;
          acc.grandTotal += grand;
          acc.paidTotal += paid;
          acc.dueTotal += grand - paid;

          return acc;
        },
        { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 }
      );

    return {
      invoices: current,
      currentTotals: sumTotals(current),
    };
  }
);


export const selectSaleTotal =
  createSelector([selectAllSaleInvoice], (invoices: Invoice[]) => {

    // --- Totals helper ---
    const sumTotals = (list: Invoice[]) =>
      list.reduce(
        (acc, inv) => {
          const net = Number(inv.totalAmount) || 0;
          const vat =
            inv.isVat === true
              ? net * (Number(inv.vatPercentage) || 0) / 100
              : 0;
          const grand = net + vat;
          const paid = Number(inv.paymentInSum) || 0;

          acc.netTotal += net;
          acc.vatTotal += vat;
          acc.grandTotal += grand;
          acc.paidTotal += paid;
          acc.dueTotal += grand - paid;

          return acc;
        },
        { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 }
      );

    return {
      totals: sumTotals(invoices),
    };
  }
);

export const selectMonthlySales = createSelector(
  [selectAllSaleInvoice],
  (invoices: Invoice[]) => {
    // Prepare an array of 12 months initialized with 0
    const monthlyTotals = Array(12).fill(0);

    const currentYear = new Date().getFullYear();

    invoices.forEach((inv) => {
      console.log("inv: ", inv.totalAmount);
      if (!inv?.date) return;

      const d = new Date(inv.date);
      if (isNaN(d.getTime())) return;

      // Only include current year
      if (d.getFullYear() !== currentYear) return;

      const monthIndex = d.getMonth(); // 0 = Jan, 11 = Dec
      const net = Number(inv.totalAmount) || 0;
      const vat =
        inv.isVat === true
          ? (net * (Number(inv.vatPercentage) || 0)) / 100
          : 0;
      const grand = net + vat;

      monthlyTotals[monthIndex] += grand;
    });

    return monthlyTotals;
  }
);

export const selectTotalSaleOrder = createSelector([selectAllSaleInvoice],(invoices: Invoice[]) => invoices.length);

export const selectSaleReport_system_2 = ( fromDate?: string, toDate?: string, containerNo?: string, partyId?: number) =>
  createSelector([selectAllSaleInvoice], (invoices: Invoice[]) => {
    // --- If searching only by partyId, skip date filter entirely ---
    const onlyPartySearch =
      Number(partyId) > 0 && !fromDate && !toDate && !containerNo;

    // --- Default to current month if not provided ---
    const now = new Date();
    let from = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    let to = toDate
      ? new Date(toDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // --- Split into previous and current period ---
    const previous = invoices.filter((inv) => {
      if (onlyPartySearch) return false; // no "previous" if showing all
      const date = new Date(inv?.date ?? "");
      return !isNaN(date.getTime()) && date < from && (inv.system === 2 || inv.isVat === true);
    });

    const current = invoices.filter((inv) => {
      const date = new Date(inv?.date ?? "");
      if (isNaN(date.getTime())) return false;

      const dateMatch = onlyPartySearch
        ? inv.system === 2 || inv.isVat === true // ignore dates
        : date >= from && date <= to && (inv.system === 2 || inv.isVat === true);

      const containerMatch = containerNo && (inv.system === 2 || inv.isVat === true)
        ? inv.items?.some(
            (item) =>
              item.container?.containerNo?.toLowerCase() ===
              containerNo.toLowerCase()
          )
        : true;

      const partyMatch = Number(partyId) > 0 && (inv.system === 2 || inv.isVat === true) ? inv.partyId === partyId : true;

      return dateMatch && containerMatch && partyMatch;
    });

    // --- Totals helper ---
    const sumTotals = (list: Invoice[]) =>
      list.reduce(
        (acc, inv) => {
          const net = Number(inv.totalAmount) || 0;
          const vat =
            inv.isVat === true
              ? net * (Number(inv.vatPercentage) || 0) / 100
              : 0;
          const grand = net + vat;
          const paid = Number(inv.paymentInSum) || 0;

          acc.netTotal += net;
          acc.vatTotal += vat;
          acc.grandTotal += grand;
          acc.paidTotal += paid;
          acc.dueTotal += grand - paid;

          return acc;
        },
        { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 }
      );

    return {
      invoices: current,
      currentTotals: sumTotals(current),
      previousTotals: sumTotals(previous),
    };
  }
);

export const selectSaleContainerReport = (
  fromDate?: string,
  toDate?: string,
  containerNo?: string
) =>
  createSelector(
    (state: RootState) => state.invoice.saleContainerReport || [],
    (items) => {
      if (!items.length)
        return {
          items: [],
          previous: { netTotal: 0, vatTotal: 0, grandTotal: 0, qtyTotal: 0 },
          current: { netTotal: 0, vatTotal: 0, grandTotal: 0, qtyTotal: 0 },
          overall: { netTotal: 0, vatTotal: 0, grandTotal: 0, qtyTotal: 0 },
        };

      const now = new Date();
      const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Handle filter cases
      const isContainerOnlySearch = !fromDate && !toDate && !!containerNo;
      const isShowAll = !fromDate && !toDate && !containerNo;

      const from = fromDate ? new Date(fromDate) : defaultFrom;
      from.setHours(0, 0, 0, 0);

      const to = toDate ? new Date(toDate) : defaultTo;
      to.setHours(23, 59, 59, 999);

      const totals = {
        previous: { netTotal: 0, vatTotal: 0, grandTotal: 0, qtyTotal: 0 },
        current: { netTotal: 0, vatTotal: 0, grandTotal: 0, qtyTotal: 0 },
      };

      const filtered = items.filter((item) => {
        const invoiceDate = new Date(item.invoice?.date ?? "");
        if (isNaN(invoiceDate.getTime())) return false;

        const net = Number(item.subTotal ?? 0);
        const vat =
          item.invoice?.isVat === true
            ? (net * Number(item.invoice?.vatPercentage ?? 0)) / 100
            : 0;
        const grand = net + vat;
        const quantity = Number(item.quantity ?? 0);

        // --- Container filter ---
        const containerMatch = containerNo
          ? item.container?.containerNo?.toLowerCase() ===
            containerNo.toLowerCase()
          : true;

        // Case 1: Only container filter (no dates)
        if (isContainerOnlySearch) {
          if (!containerMatch) return false;
          totals.current.netTotal += net;
          totals.current.vatTotal += vat;
          totals.current.grandTotal += grand;
          totals.current.qtyTotal += quantity;
          return true;
        }

        // Case 2: Show all (no filters)
        if (isShowAll) {
          totals.current.netTotal += net;
          totals.current.vatTotal += vat;
          totals.current.grandTotal += grand;
          totals.current.qtyTotal += quantity;
          return true;
        }

        // --- Previous totals (before range) ---
        if (invoiceDate < from) {
          totals.previous.netTotal += net;
          totals.previous.vatTotal += vat;
          totals.previous.grandTotal += grand;
          totals.previous.qtyTotal += quantity;
        }

        // --- Current totals (within range) ---
        const dateMatch = invoiceDate >= from && invoiceDate <= to;
        if (dateMatch && containerMatch) {
          totals.current.netTotal += net;
          totals.current.vatTotal += vat;
          totals.current.grandTotal += grand;
          totals.current.qtyTotal += quantity;
          return true;
        }

        return false;
      });

      return {
        items: filtered,
        previous: totals.previous,
        current: totals.current,
        overall: {
          netTotal: totals.previous.netTotal + totals.current.netTotal,
          vatTotal: totals.previous.vatTotal + totals.current.vatTotal,
          grandTotal: totals.previous.grandTotal + totals.current.grandTotal,
          qtyTotal: totals.previous.qtyTotal + totals.current.qtyTotal,
        },
      };
    }
  );



export const selectSaleCashReport = (fromDate?: string, toDate?: string) => 
  createSelector(
  (state: RootState) => state.invoice.saleCashReport || [],
  (reports) => {
    if (!reports.length) return [];

    // --- Default to current month if no range provided ---
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const from = fromDate ? new Date(fromDate) : defaultFrom;
    from.setHours(0, 0, 0, 0);

    const to = toDate ? new Date(toDate) : defaultTo;
    to.setHours(23, 59, 59, 999);

    return reports.filter((r) => {
      const reportDate = new Date(r.date);
      if (isNaN(reportDate.getTime())) return false;
      return reportDate >= from && reportDate <= to;
    });
  }
);

export const selectBillReport = (fromDate?: string, toDate?: string, containerNo?: string) => 
  createSelector([selectAllBillReport], (invoices: Invoice[]) => {
  if (!invoices.length) {
    return {
      invoices: [],
      previous: { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 },
      current: { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 },
      overall: { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 },
    };
  }

  // --- Default to current month if no range provided ---
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const from = fromDate ? new Date(fromDate) : defaultFrom;
  from.setHours(0, 0, 0, 0);

  const to = toDate ? new Date(toDate) : defaultTo;
  to.setHours(23, 59, 59, 999);

  const totals = {
    previous: { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 },
    current: { netTotal: 0, vatTotal: 0, grandTotal: 0, paidTotal: 0, dueTotal: 0 },
  };

  const filtered = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice?.date ?? "");
    if (isNaN(invoiceDate.getTime())) return false;

    // --- Container filter ---
    let containerMatch = true;
    if (containerNo) {
      containerMatch =
        invoice.container?.containerNo?.toLowerCase() ===
        containerNo.toLowerCase();
    }

    // --- Calculate amounts ---
    const net = Number(invoice.totalAmount ?? 0);
    const vat =
      invoice?.isVat === true
        ? (net * Number(invoice?.vatPercentage ?? 0)) / 100
        : 0;
    const grand = net + vat;
    const paid = Number(invoice.totalPaid ?? 0);
    const due = grand - paid;

    // --- Previous totals ---
    if (invoiceDate < from) {
      totals.previous.netTotal += net;
      totals.previous.vatTotal += vat;
      totals.previous.grandTotal += grand;
      totals.previous.paidTotal += paid;
      totals.previous.dueTotal += due;
    }

    // --- Current date range filter ---
    const dateMatch = invoiceDate >= from && invoiceDate <= to;

    if (dateMatch && containerMatch) {
      totals.current.netTotal += net;
      totals.current.vatTotal += vat;
      totals.current.grandTotal += grand;
      totals.current.paidTotal += paid;
      totals.current.dueTotal += due;
      return true;
    }

    return false;
  });

  return {
    invoices: filtered,
    previous: totals.previous,
    current: totals.current,
    overall: {
      netTotal: totals.previous.netTotal + totals.current.netTotal,
      vatTotal: totals.previous.vatTotal + totals.current.vatTotal,
      grandTotal: totals.previous.grandTotal + totals.current.grandTotal,
      paidTotal: totals.previous.paidTotal + totals.current.paidTotal,
      dueTotal: totals.previous.dueTotal + totals.current.dueTotal,
    },
  };
});

export const selectAllInvoicePagination = (state: RootState): Invoice[] => state.invoice.dataPaginated || [];
export const selectTotalPages = (state: RootState) => state.invoice.totalPages;
export const selectCurrentPage = (state: RootState) => state.invoice.currentPage;
export const selectTotalItems = (state: RootState) => state.invoice.totalItems;

export const selectAllInvoiceByType = (invoiceType: string) => createSelector([selectAllInvoice], (invoices) => {
  if (invoiceType === "all") return [...invoices];

  if (invoiceType === "purchase") {
    return invoices.filter((invoice) =>
      ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    );
  }

  if (invoiceType === "sale") {
    return invoices.filter((invoice) =>
      ["sale", "wholesale_sale", "fix_sale", "unfix_sale"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      ) && invoice.system === 1
    );
  }

  if (invoiceType === "bill") {
    return invoices.filter((invoice) =>
      ["clearance_bill"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    );
  }

  return [];
});

export const selectAllInvoiceByTypeSystem_2 = (invoiceType: string) => createSelector([selectAllInvoice], (invoices) => {
  if (invoiceType === "all") return [...invoices];

  if (invoiceType === "purchase") {
    return invoices.filter((invoice) =>
      ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    );
  }

  if (invoiceType === "sale") {
  if (!Array.isArray(invoices)) return [];
  
  return invoices.filter(
    (invoice) =>
      ["sale", "wholesale_sale", "fix_sale", "unfix_sale"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      ) &&
      (invoice.system === 2 || invoice.isVat === true)
  );
}


  if (invoiceType === "bill") {
    return invoices.filter((invoice) =>
      ["clearance_bill"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    );
  }

  return [];
});

export const selectInvoiceById = (state: RootState) => state.invoice.invoiceData;

export const selectPurchaseInvoice = createSelector(
  [selectAllInvoice],
  (invoices) =>
    invoices.filter((invoice) =>
      ["purchase", "wholesale_purchase", "fix_purchase", "unfix_purchase"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    )
);

export const selectSaleInvoice = createSelector(
  [selectAllInvoice],
  (invoices) =>
    invoices.filter((invoice) =>
      ["sale", "wholesale_sale", "fix_sale", "unfix_sale"].includes(
        invoice.invoiceType?.toLowerCase() ?? ""
      )
    )
);


