import { useMemo, useState, useEffect, Fragment } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableFooter,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll } from "../features/ledgerThunks.ts";
import { fetchPartyById } from "../../party/features/partyThunks.ts";
import * as partyAPI from "../../party/features/partyAPI.ts";
import { type Party } from "../../party/features/partyTypes.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";
import { selectLedgerByPartyType, selectLedgerStatus } from "../features/ledgerSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectPartyById } from "../../party/features/partySelectors.ts";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowPathIcon, PrinterIcon } from "@heroicons/react/20/solid";
import AsyncSelect from "react-select/async";
import { type StylesConfig } from "react-select";

type PartyFilterOption = { value: string; label: string };

const partySelectStyles: StylesConfig<PartyFilterOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    borderRadius: '6px',
    borderColor: state.isFocused ? '#465fff' : '#e5e7eb',
    boxShadow: 'none',
    '&:hover': { borderColor: '#465fff' },
  }),
  valueContainer: (base) => ({ ...base, padding: '0 10px' }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, height: '34px' }),
  menu: (base) => ({ ...base, zIndex: 30, borderRadius: '8px', overflow: 'hidden' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#465fff' : state.isFocused ? '#eef2ff' : 'white',
  }),
};

export default function LedgerList() {
  const { ledgerType, partyId } = useParams();
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [allLedgerPartyFilter, setAllLedgerPartyFilter] = useState<PartyFilterOption | null>(null);
  const [breakdownPartyFilter, setBreakdownPartyFilter] = useState<PartyFilterOption | null>(null);
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryPageInput, setSummaryPageInput] = useState('1');
  const [summaryPageSize, setSummaryPageSize] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);

  const authUser = useSelector(selectUser);
  const categories = useSelector(selectAllCategory);

  const partyID = Number(partyId) || 0;
  const isPartyBreakdown = Number(partyId) > 0;
  const businessID = Number(authUser?.business?.id) ?? 0;

  const party = useSelector(selectPartyById(partyID));
  const status = useSelector(selectLedgerStatus);
  const ledgers = useSelector(selectLedgerByPartyType(businessID, String(ledgerType), partyID));
  

  useEffect(() => {
    dispatch(fetchAll({ summary: !isPartyBreakdown }));
    dispatch(fetchAllCategory());
  }, [dispatch, refreshKey, isPartyBreakdown, partyID]);

  useEffect(() => {
    if (isPartyBreakdown) {
      dispatch(fetchPartyById(partyID));
    }
  }, [dispatch, isPartyBreakdown, partyID]);

  useEffect(() => {
    if (isPartyBreakdown && party) {
      setBreakdownPartyFilter({ value: String(partyID), label: `${partyID} - ${party.name}` });
    }
  }, [isPartyBreakdown, party, partyID]);

  // Filter users by name/email
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((ledger) =>
      (!fromDate || ledger.date >= fromDate) &&
      (!toDate || ledger.date <= toDate) &&
      (!partyFilter ||
        (partyFilter === 'supplier' && ledger.party?.type === 'supplier') ||
        (partyFilter === 'customer' && ledger.party?.type === 'customer') ||
        String(ledger.partyId) === partyFilter)
    );
  }, [ledgers, fromDate, toDate, partyFilter]);

  const loadPartyOptions = async (inputValue: string) => {
    const data = await partyAPI.fetchPartyPaginated({
      page: 1,
      limit: 20,
      type: 'all',
      filterText: inputValue.trim() || undefined,
    });
    return data.parties.map((partyOption: Party) => ({
      value: String(partyOption.id),
      label: `${partyOption.id} - ${partyOption.name}`,
    }));
  };

  const hasLedgerFilters = Boolean(fromDate || toDate || (!isPartyBreakdown && partyFilter));
  const clearLedgerFilters = () => {
    setFromDate('');
    setToDate('');
    if (!isPartyBreakdown) {
      setPartyFilter('');
      setAllLedgerPartyFilter(null);
    }
  };

  const selectedParty = party ?? ledgers.find((ledger) => ledger.partyId === partyID)?.party;
  const statementPeriod = useMemo(() => {
    if (fromDate && toDate) return `Statement period: ${fromDate} to ${toDate}`;
    if (fromDate) return `Statement period: From ${fromDate}`;
    if (toDate) return `Statement period: Up to ${toDate}`;
    return `Statement date: ${new Date().toLocaleDateString('en-CA')}`;
  }, [fromDate, toDate]);


  // Compute cumulative balance for all ledgers
  const ledgersWithBalance = useMemo(() => {
    const balancesByCurrency = new Map<string, number>();
    return filteredLedgers.map((ledger) => {
      const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
      const movement = (Number(ledger.credit) || 0) - (Number(ledger.debit) || 0);
      const cumulativeBalance = (balancesByCurrency.get(currency) || 0) + movement;
      balancesByCurrency.set(currency, cumulativeBalance);
      return {
        ...ledger,
        cumulativeBalance,
        cumulativeBalances: Array.from(balancesByCurrency.entries()).sort(([first], [second]) => first.localeCompare(second)),
      };
    });
  }, [filteredLedgers]);

  const transactionTotalsByCurrency = useMemo(() => filteredLedgers.reduce<Record<string, { debit: number; credit: number }>>((totals, ledger) => {
    const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
    if (!totals[currency]) totals[currency] = { debit: 0, credit: 0 };
    totals[currency].debit += Number(ledger.debit) || 0;
    totals[currency].credit += Number(ledger.credit) || 0;
    return totals;
  }, {}), [filteredLedgers]);

  const dateRangeBalances = useMemo(() => {
    const balances = ledgers.reduce<Record<string, { opening: number; closing: number }>>((result, ledger) => {
      const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
      const amount = (Number(ledger.credit) || 0) - (Number(ledger.debit) || 0);
      const entryDate = ledger.date;

      if (!result[currency]) result[currency] = { opening: 0, closing: 0 };
      if (!fromDate || entryDate < fromDate) result[currency].opening += amount;
      if (!toDate || entryDate <= toDate) result[currency].closing += amount;
      return result;
    }, {});

    return Object.entries(balances).sort(([first], [second]) => first.localeCompare(second));
  }, [ledgers, fromDate, toDate]);

  type CurrencyTotals = {
    purchaseDebit: number;
    purchaseCredit: number;
    purchaseStockDebit: number;
    purchaseStockCredit: number;
    saleDebit: number;
    saleCredit: number;
    saleStockDebit: number;
    saleStockCredit: number;
    advanceDebit: number;
    advanceCredit: number;
    purchaseBalance: number;
    saleBalance: number;
    advanceBalance: number;
    purchaseStockBalance: number;
    saleStockBalance: number;
    closeBalance: number;
    purchageMargin: number;
    saleMargin: number;
  };

  const ledgerTotalsByCurrency = useMemo(() => {
    return ledgersWithBalance.reduce<Record<string, CurrencyTotals>>((totals, ledger) => {
      const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
      const debit = Number(ledger.debit) || 0;
      const credit = Number(ledger.credit) || 0;
      const debitQty = Number(ledger.debitQty) || 0;
      const creditQty = Number(ledger.creditQty) || 0;

      if (!totals[currency]) {
        totals[currency] = {
          purchaseDebit: 0,
          purchaseCredit: 0,
          purchaseStockDebit: 0,
          purchaseStockCredit: 0,
          saleDebit: 0,
          saleCredit: 0,
          saleStockDebit: 0,
          saleStockCredit: 0,
          purchaseBalance: 0,
          saleBalance: 0,
          advanceDebit: 0,
          advanceCredit: 0,
          purchaseStockBalance: 0,
          saleStockBalance: 0,
          advanceBalance: 0,
          closeBalance: 0,
          purchageMargin: 0,
          saleMargin: 0,
        };
      }

      const current = totals[currency];

      if (
        ["purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase","clearance_bill", "payment_out", "stock_in", "discount_purchase"].includes(ledger.transactionType)
      ) {
        current.purchaseDebit += debit;
        current.purchaseCredit += credit;
        current.purchaseStockDebit += debitQty;
        current.purchaseStockCredit += creditQty;
      }

      if (
        ["sale", "fix_sale", "unfix_sale", "wholesale_sale","payment_in", "stock_out", "discount_sale"].includes(ledger.transactionType)
      ) {
        current.saleDebit += debit;
        current.saleCredit += credit;
        current.saleStockDebit += debitQty;
        current.saleStockCredit += creditQty;
      }

      if (
        ["capital_in","advance_received", "advance_payment_deduct", "premium_received", "deposit"].includes(ledger.transactionType)
      ) {
        current.advanceCredit += credit;
      }

      if (
        ["capital_out", "advance_payment", "advance_received_deduct", "premium_paid", "withdraw"].includes(ledger.transactionType)
      ) {
        current.advanceDebit += debit;
      }

      current.purchaseBalance = current.purchaseCredit - current.purchaseDebit;
      current.purchaseStockBalance = current.purchaseStockDebit - current.purchaseStockCredit;
      current.saleBalance = current.saleCredit - current.saleDebit;
      current.saleStockBalance = current.saleStockDebit - current.saleStockCredit;
      current.advanceBalance = current.advanceCredit - current.advanceDebit;
      current.closeBalance = current.purchaseBalance + current.saleBalance;

      return totals;
    }, {});
  }, [ledgersWithBalance]);

  const partySummary = useMemo(() => {
    const summaries = ledgersWithBalance.reduce<Record<string, {
      partyName: string;
      partyId?: number;
      currency: string;
      entries: number;
      debit: number;
      credit: number;
    }>>((result, ledger) => {
      const partyName = ledger.party?.name || 'No party';
      const currency = ledger.currency || ledger.invoice?.currency || 'UNKNOWN';
      const key = `${ledger.partyId ?? 'none'}-${currency}`;

      if (!result[key]) {
        result[key] = { partyName, partyId: ledger.partyId, currency, entries: 0, debit: 0, credit: 0 };
      }

      result[key].entries += 1;
      result[key].debit += Number(ledger.debit) || 0;
      result[key].credit += Number(ledger.credit) || 0;
      return result;
    }, {});

    return Object.values(summaries)
      .filter((summary) => Math.abs(summary.credit - summary.debit) > 0.000001)
      .sort((a, b) =>
      (a.partyId ?? Number.MAX_SAFE_INTEGER) - (b.partyId ?? Number.MAX_SAFE_INTEGER) ||
      a.currency.localeCompare(b.currency, undefined, { sensitivity: 'base', numeric: true })
      );
  }, [ledgersWithBalance]);

  const totalSummaryPages = Math.max(Math.ceil(partySummary.length / summaryPageSize), 1);
  const paginatedPartySummary = useMemo(
    () => partySummary.slice((summaryPage - 1) * summaryPageSize, summaryPage * summaryPageSize),
    [partySummary, summaryPage, summaryPageSize],
  );

  useEffect(() => {
    setSummaryPage(1);
  }, [fromDate, toDate, partyFilter, summaryPageSize]);

  useEffect(() => {
    if (summaryPage > totalSummaryPages) setSummaryPage(totalSummaryPages);
  }, [summaryPage, totalSummaryPages]);

  useEffect(() => setSummaryPageInput(String(summaryPage)), [summaryPage]);

  return (
    <>
      <PageMeta
        title={`${ledgerType ? ledgerType.charAt(0).toUpperCase() + ledgerType.slice(1).toLowerCase() : ''} Ledger`}
        description="Voucher & Ledger with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${ledgerType ? ledgerType.charAt(0).toUpperCase() + ledgerType.slice(1).toLowerCase() : ''} Ledger`} />

      <section className={`${isPartyBreakdown ? 'mb-6 rounded-2xl' : 'mb-0 rounded-t-2xl rounded-b-none'} overflow-hidden border border-gray-200 bg-white shadow-sm print:hidden dark:border-white/[0.08] dark:bg-white/[0.03]`}>
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Accounts</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{isPartyBreakdown ? 'Party Ledger Breakdown' : ledgerType === 'all' ? 'All Ledger Entries' : `${ledgerType} Ledger`}</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedParty ? `${selectedParty.name} - ` : ''}{filteredLedgers.length.toLocaleString()} entries found</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button onClick={() => { setFromDate(''); setToDate(''); if (!isPartyBreakdown) { setPartyFilter(''); setAllLedgerPartyFilter(null); } setRefreshKey((key) => key + 1); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PrinterIcon className="h-4 w-4" /> Print</button></div>
        </div>
        <div className="bg-gray-50/70 px-5 py-4 dark:bg-white/[0.02] sm:px-6"><div className="mb-3"><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Select a party or date range to refine ledger entries.</p></div><div className="flex items-start justify-between gap-4"><div className={`grid flex-1 gap-3 ${isPartyBreakdown ? 'max-w-4xl sm:grid-cols-3' : 'max-w-md'}`}>{isPartyBreakdown && <><label className="block text-xs font-medium text-gray-600 dark:text-gray-300">From date<input type="date" value={fromDate} max={toDate || undefined} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setFromDate(event.target.value)} className="mt-1 h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label><label className="block text-xs font-medium text-gray-600 dark:text-gray-300">To date<input type="date" value={toDate} min={fromDate || undefined} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setToDate(event.target.value)} className="mt-1 h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label></>}<label className="block text-xs font-medium text-gray-600 dark:text-gray-300">{isPartyBreakdown ? 'Switch party' : 'Party filter'}<AsyncSelect<PartyFilterOption, false> key={isPartyBreakdown ? 'breakdown-party-filter' : 'all-ledger-party-filter'} value={isPartyBreakdown ? breakdownPartyFilter : allLedgerPartyFilter} onChange={(option) => { if (isPartyBreakdown) { if (option) navigate(`/ledger/all/list/${option.value}`); return; } setAllLedgerPartyFilter(option); setPartyFilter(option?.value ?? ''); }} defaultOptions cacheOptions loadOptions={loadPartyOptions} placeholder="Search and select a party" styles={partySelectStyles} menuPortalTarget={document.body} menuPosition="fixed" className="mt-1" classNamePrefix="react-select" /></label></div>{hasLedgerFilters && <button type="button" onClick={clearLedgerFilters} className="mt-5 shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filters</button>}</div></div>
      </section>

      {isPartyBreakdown ? 
        <div>
          <div id="print-section">

            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="relative border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Transaction details</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selectedParty?.name || `Party #${partyID}`}</h3>
                  {selectedParty?.phoneNumber && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Phone: {selectedParty.phoneCode}{selectedParty.phoneNumber}</p>}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{statementPeriod}</p>
                  {dateRangeBalances.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm lg:absolute lg:right-5 lg:top-4 lg:mt-0 lg:justify-end"><span className="font-medium text-gray-600 dark:text-gray-300">Closing balance:</span>{dateRangeBalances.map(([currency, balance]) => <span key={currency} className={`rounded-md bg-white px-2 py-1 font-semibold shadow-sm dark:bg-white/[0.06] ${balance.closing > 0 ? 'text-green-600' : balance.closing < 0 ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>{currency} {balance.closing.toFixed(2)}{fromDate && <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">(Open {balance.opening.toFixed(2)})</span>}</span>)}</div>}
                </div>
                
                <div className="max-w-full overflow-x-auto px-5 py-2">
                  <Table className="min-w-[1200px] border border-gray-300 text-sm [&_td]:border [&_td]:border-gray-300 [&_th]:border [&_th]:border-gray-300 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
                    <TableHeader className="border border-gray-300 bg-gray-50 px-2 py-2 text-center font-semibold dark:border-white/[0.12] dark:bg-white/[0.04]">
                      <TableRow>
                        <TableCell isHeader colSpan={5} className="px-3 py-2">{""}</TableCell>
                        
                        <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Transaction Amount</TableCell>

                        <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">{""}</TableCell>

                        {/* <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell> */}
                      </TableRow>

                      <TableRow>
                        <TableCell isHeader className="text-center px-2 py-2">Sl</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Transaction / Date</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Reference</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Description</TableCell>
                        
                        <TableCell isHeader className="text-center px-2 py-2">Account</TableCell>
                        <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
                        <TableCell className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>

                        <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Balance</TableCell>

                        {/* <TableCell isHeader className="text-center px-2 py-2">Created</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Updated</TableCell> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {status === 'loading' ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                          </TableCell>
                        </TableRow>
                      ) : ledgersWithBalance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            No data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        ledgersWithBalance.map((ledger, index) => (
                          <TableRow key={`primary-${ledger.id}`} className="border-b border-gray-100 transition-colors hover:bg-brand-50/40 dark:border-white/[0.05] dark:hover:bg-white/[0.03]">
                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400"><div>{ledger.transactionType}</div><div className="mt-0.5 text-xs text-gray-400">{ledger.date}</div></TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.paymentId === null && ledger.stockId === null ? ledger.invoiceRefNo : ""}
                              {ledger.paymentRefNo}
                              {ledger.stockRefNo}
                              {ledger.paymentId !== null && ledger?.payment?.invoice && (
                                <>
                                  <br />
                                  <span className="text-xs">
                                    {`${ledger.payment.invoice.prefix ?? ""}-${String(ledger.payment.invoiceId ?? 0).padStart(6, "0")}`}
                                  </span>
                                </>
                              )}
                              {ledger.stockId !== null && ledger?.stock?.invoice && (
                                <>
                                  <br />
                                  <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, '0')}`}</span>
                                </>
                              )}
                            </TableCell>

                            <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                  ledger.description.split('<br />').map((line, idx) => (
                                    <Fragment key={`${line}-${idx}`}>
                                      {line}
                                      <br />
                                    </Fragment>
                                  ))
                                ) : ledger.description || ''
                                }
                              </div>
                            </TableCell>
                            
                            <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                              {ledger.bank?.accountName ?? "---"}
                            </TableCell>

                            <TableCell className="border border-gray-300 text-center px-2 py-2">{Number(ledger.debit) > 0 ? Number(ledger.debit).toFixed(2) : "-"}</TableCell>
                            <TableCell className="border border-gray-300 text-center px-2 py-2">{Number(ledger.credit) > 0 ? Number(ledger.credit).toFixed(2) : "-"}</TableCell>

                            { false && (ledgerType === "purchase" || ledgerType === "all") && (
                              <>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">{["purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "payment_out", "discount_purchase"].includes(ledger.transactionType) && Number(ledger.debit) > 0 ? Number(ledger.debit).toFixed(2) : "-"}</TableCell>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">{["purchase", "clearance_bill", "wholesale_purchase", "fix_purchase", "unfix_purchase", "discount_purchase"].includes(ledger.transactionType) && Number(ledger.credit) > 0 ? Number(ledger.credit).toFixed(2) : "-"}</TableCell>
                                
                                {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                  <>
                                    <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                      { 
                                        ledger.transactionType === "purchase" || 
                                        ledger.transactionType === "clearance_bill" || 
                                        ledger.transactionType === "wholesale_purchase" || 
                                        ledger.transactionType === "fix_purchase" || 
                                        ledger.transactionType === "unfix_purchase" || 
                                        ledger.transactionType === "stock_in" 
                                        ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                      }
                                    </TableCell>
                                    <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                      { 
                                        ledger.transactionType === "purchase" || 
                                        ledger.transactionType === "clearance_bill" || 
                                        ledger.transactionType === "wholesale_purchase" || 
                                        ledger.transactionType === "fix_purchase" || 
                                        ledger.transactionType === "unfix_purchase" || 
                                        ledger.transactionType === "stock_in" 
                                        ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                      }
                                    </TableCell>
                                  </>
                                )}
                              </>
                            )}
                            
                            
                            { false && (ledgerType === "sale" || ledgerType === "all") && (
                              <>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">{["sale", "wholesale_sale", "fix_sale", "unfix_sale", "discount_sale"].includes(ledger.transactionType) && Number(ledger.debit) > 0 ? Number(ledger.debit).toFixed(2) : "-"}</TableCell>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">{["sale", "wholesale_sale", "fix_sale", "unfix_sale", "payment_in", "discount_sale"].includes(ledger.transactionType) && Number(ledger.credit) > 0 ? Number(ledger.credit).toFixed(2) : "-"}</TableCell>
                                
                                {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                  <>
                                  <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                    { 
                                      ledger.transactionType === "sale" || 
                                      ledger.transactionType === "wholesale_sale" || 
                                      ledger.transactionType === "fix_sale" || 
                                      ledger.transactionType === "unfix_sale" || 
                                      ledger.transactionType === "stock_out" 
                                      ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                    }
                                  </TableCell>
                                  <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                    { 
                                      ledger.transactionType === "sale" || 
                                      ledger.transactionType === "wholesale_sale" || 
                                      ledger.transactionType === "fix_sale" || 
                                      ledger.transactionType === "unfix_sale" || 
                                      ledger.transactionType === "stock_out" 
                                      ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                    }
                                  </TableCell>
                                  </>
                                )}
                              </>
                            )}

                            {false && categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "capital_out" || 
                                  ledger.transactionType === "advance_payment" || 
                                  ledger.transactionType === "advance_received_deduct" ||
                                  ledger.transactionType === "withdraw" ||
                                  ledger.transactionType === "premium_paid"
                                  ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                                }
                              </TableCell>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "capital_in" || 
                                  ledger.transactionType === "advance_received" || 
                                  ledger.transactionType === "advance_payment_deduct" ||
                                  ledger.transactionType === "deposit" ||
                                  ledger.transactionType === "premium_received"
                                  ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                                }
                              </TableCell>
                              </>
                            )}

                            <TableCell className="border border-gray-300 text-center px-2 py-2">
                              {ledger.cumulativeBalances.map(([currency, balance]) => <div key={currency}>{currency} {balance.toFixed(2)}</div>)}
                            </TableCell>
                            
                          </TableRow>
                        ))
                      )}
                    </TableBody>

                    <TableFooter className="border-t-2 border-gray-200 bg-gray-50 text-sm text-gray-800 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-gray-200"><TableRow><TableCell colSpan={5} className="border border-gray-500 text-center font-semibold">Total</TableCell><TableCell className="border border-gray-500 text-center px-2 py-2">{Object.entries(transactionTotalsByCurrency).map(([currency, totals]) => <div key={currency}>{currency} {totals.debit.toFixed(2)}</div>)}</TableCell><TableCell className="border border-gray-500 text-center px-2 py-2">{Object.entries(transactionTotalsByCurrency).map(([currency, totals]) => <div key={currency}>{currency} {totals.credit.toFixed(2)}</div>)}</TableCell><TableCell className="border border-gray-500 text-center px-2 py-2">{Object.entries(transactionTotalsByCurrency).map(([currency, totals]) => <div key={currency}>{currency} {(totals.credit - totals.debit).toFixed(2)}</div>)}</TableCell></TableRow><TableRow><TableCell colSpan={5} className="border border-gray-500 text-center font-semibold">Closing Balance:</TableCell><TableCell colSpan={3} className="border border-gray-500 text-center px-2 py-2 font-semibold">{Object.entries(transactionTotalsByCurrency).map(([currency, totals]) => <div key={currency}>{currency} {(totals.credit - totals.debit).toFixed(2)}</div>)}</TableCell></TableRow></TableFooter>
                  
                  </Table>
                
                </div>
              </div>
            </div>
          </div>
        </div>
      :
        <div>
          
            <section className="overflow-hidden rounded-b-2xl border border-t-0 border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
                <Table className="min-w-[1000px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
                  <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                    <TableRow>
                      <TableCell isHeader className="px-3 py-3 text-center">ID</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Party name</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Currency</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Entries</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Debit</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Credit</TableCell>
                      <TableCell isHeader className="px-3 py-3 text-center">Balance</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status === 'loading' ? (
                      <TableRow><TableCell colSpan={7} className="px-1 py-5 text-center text-sm text-gray-500">Data Loading...</TableCell></TableRow>
                    ) : partySummary.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="px-1 py-5 text-center text-sm text-gray-500">No party data found.</TableCell></TableRow>
                    ) : paginatedPartySummary.map((summary) => {
                      const balance = summary.credit - summary.debit;
                      return (
                        <TableRow key={`${summary.partyName}-${summary.currency}`} className="border-t border-gray-100 dark:border-white/[0.05]">
                          <TableCell className="px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">{summary.partyId ?? '-'}</TableCell>
                          <TableCell className="px-1 py-1 text-center font-medium">
                            {summary.partyId ? (
                              <button
                                type="button"
                                onClick={() => navigate(`/ledger/all/list/${summary.partyId}`)}
                                className="text-center text-brand-600 hover:underline dark:text-brand-400"
                              >
                                {summary.partyName}
                              </button>
                            ) : (
                              <span className="text-gray-800 dark:text-gray-200">{summary.partyName}</span>
                            )}
                          </TableCell>
                          <TableCell className="px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">{summary.currency}</TableCell>
                          <TableCell className="px-1 py-1 text-center">{summary.entries}</TableCell>
                          <TableCell className="px-1 py-1 text-center">{summary.debit.toFixed(2)}</TableCell>
                          <TableCell className="px-1 py-1 text-center">{summary.credit.toFixed(2)}</TableCell>
                          <TableCell className={`px-1 py-1 text-center font-semibold ${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : ''}`}>{balance.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={summaryPageSize} onChange={(event) => setSummaryPageSize(Number(event.target.value))} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
                <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button onClick={() => setSummaryPage(1)} disabled={summaryPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setSummaryPage((page) => page - 1)} disabled={summaryPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={summaryPageInput} onChange={(event) => setSummaryPageInput(event.target.value)} onBlur={() => setSummaryPage(Math.min(Math.max(Number(summaryPageInput) || 1, 1), totalSummaryPages))} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {totalSummaryPages}</span><button onClick={() => setSummaryPage((page) => page + 1)} disabled={summaryPage >= totalSummaryPages} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setSummaryPage(totalSummaryPages)} disabled={summaryPage >= totalSummaryPages} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
              </div>
            </section>
            {isPartyBreakdown && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-3">
              <div className="max-w-full overflow-x-hidden">
                <Table>
                  <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      
                      { (ledgerType === "purchase" || ledgerType === "all") && (
                        <>
                          <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Purchase</TableCell>
                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell colSpan={2} className="border-l border-gray-200 bg-emerald-50/60 text-center px-3 py-2 font-semibold text-emerald-800 dark:border-white/[0.08] dark:bg-emerald-500/5 dark:text-emerald-300">Purchase Stock</TableCell>
                          )}
                        </>
                      )}

                      { (ledgerType === "sale" || ledgerType === "all") && (
                        <>
                            <TableCell colSpan={2} className="border-l border-gray-200 bg-sky-50 text-center px-3 py-2 font-semibold text-sky-800 dark:border-white/[0.08] dark:bg-sky-500/10 dark:text-sky-300">Sale</TableCell>
                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell colSpan={2} className="border-l border-gray-200 bg-sky-50/60 text-center px-3 py-2 font-semibold text-sky-800 dark:border-white/[0.08] dark:bg-sky-500/5 dark:text-sky-300">Sale Stock</TableCell>
                          )}
                        </>
                      )}
                      {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                        <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Advance</TableCell>
                      )}

                      <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">{""}</TableCell>

                      {/* <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell> */}
                    </TableRow>

                    <TableRow>
                      <TableCell isHeader className="text-center px-2 py-2">Sl</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Transaction</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Reference</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Date</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Party Name</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Description</TableCell>
                      
                      <TableCell isHeader className="text-center px-2 py-2">Account</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Currency</TableCell>

                      { (ledgerType === "purchase" || ledgerType === "all") && (
                        <>
                          <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>
                          
                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                            <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
                            </>
                          )}
                        </>
                      )}

                      { (ledgerType === "sale" || ledgerType === "all") && (
                        <>
                          <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>

                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                            <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
                            </>
                          )}
                        </>
                      )}
                      {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                        <>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Credit</TableCell>
                        </>
                      )}

                      <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Balance</TableCell>

                      {/* <TableCell isHeader className="text-center px-2 py-2">Created</TableCell>
                      <TableCell isHeader className="text-center px-2 py-2">Updated</TableCell> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status === 'loading' ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                          Loading data...
                        </TableCell>
                      </TableRow>
                    ) : ledgersWithBalance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                          No data found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgersWithBalance.map((ledger, index) => (
                        <TableRow key={`primary-${ledger.id}`} className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.transactionType}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.paymentId === null && ledger.stockId === null ? ledger.invoiceRefNo : ""}
                            {ledger.paymentRefNo}
                            {ledger.stockRefNo}
                            {ledger.paymentId !== null && ledger?.payment?.invoice && (
                              <>
                                <br />
                                <span className="text-xs">
                                  {`${ledger.payment.invoice.prefix ?? ""}-${String(ledger.payment.invoiceId ?? 0).padStart(6, "0")}`}
                                </span>
                              </>
                            )}
                            {ledger.stockId !== null && ledger?.stock?.invoice && (
                              <>
                                <br />
                                <span className="text-xs">{`${ledger.stock.invoice.prefix ?? ""} - ${String(ledger.stock.invoiceId ?? 0).padStart(6, '0')}`}</span>
                              </>
                            )}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.date}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.party?.name}
                          </TableCell>

                          <TableCell className="text-center px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              {(ledger.transactionType === "purchase" || ledger.transactionType === "sale" || ledger.transactionType === "clearance_bill") && ledger.description ? (
                                ledger.description.split('<br />').map((line, idx) => (
                                  <Fragment key={`${line}-${idx}`}>
                                    {line}
                                    <br />
                                  </Fragment>
                                ))
                              ) : ledger.description || ''
                              }
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.bank?.accountName ?? "---"}
                          </TableCell>

                          <TableCell className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                            {ledger.currency ?? "---"}
                          </TableCell>

                          { (ledgerType === "purchase" || ledgerType === "all") && (
                            <>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "purchase" || 
                                  ledger.transactionType === "clearance_bill" || 
                                  ledger.transactionType === "wholesale_purchase" || 
                                  ledger.transactionType === "fix_purchase" || 
                                  ledger.transactionType === "unfix_purchase" || 
                                  ledger.transactionType === "payment_out" || 
                                  ledger.transactionType === "discount_purchase" 
                                  ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                                }
                              </TableCell>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "purchase" || 
                                  ledger.transactionType === "clearance_bill" || 
                                  ledger.transactionType === "wholesale_purchase" || 
                                  ledger.transactionType === "fix_purchase" || 
                                  ledger.transactionType === "unfix_purchase" || 
                                  ledger.transactionType === "discount_purchase" 
                                  ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                                }
                              </TableCell>
                              
                              {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                <>
                                  <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                    { 
                                      ledger.transactionType === "purchase" || 
                                      ledger.transactionType === "clearance_bill" || 
                                      ledger.transactionType === "wholesale_purchase" || 
                                      ledger.transactionType === "fix_purchase" || 
                                      ledger.transactionType === "unfix_purchase" || 
                                      ledger.transactionType === "stock_in" 
                                      ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                    }
                                  </TableCell>
                                  <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                    { 
                                      ledger.transactionType === "purchase" || 
                                      ledger.transactionType === "clearance_bill" || 
                                      ledger.transactionType === "wholesale_purchase" || 
                                      ledger.transactionType === "fix_purchase" || 
                                      ledger.transactionType === "unfix_purchase" || 
                                      ledger.transactionType === "stock_in" 
                                      ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                    }
                                  </TableCell>
                                </>
                              )}
                            </>
                          )}
                          
                          
                          { (ledgerType === "sale" || ledgerType === "all") && (
                            <>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "sale" || 
                                  ledger.transactionType === "wholesale_sale" || 
                                  ledger.transactionType === "fix_sale" || 
                                  ledger.transactionType === "unfix_sale" || 
                                  ledger.transactionType === "discount_sale" 
                                  ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                                }
                              </TableCell>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { 
                                  ledger.transactionType === "sale" || 
                                  ledger.transactionType === "wholesale_sale" || 
                                  ledger.transactionType === "fix_sale" || 
                                  ledger.transactionType === "unfix_sale" || 
                                  ledger.transactionType === "payment_in" || 
                                  ledger.transactionType === "discount_sale" 
                                  ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                                }
                              </TableCell>
                              
                              {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                <>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { 
                                    ledger.transactionType === "sale" || 
                                    ledger.transactionType === "wholesale_sale" || 
                                    ledger.transactionType === "fix_sale" || 
                                    ledger.transactionType === "unfix_sale" || 
                                    ledger.transactionType === "stock_out" 
                                    ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                  }
                                </TableCell>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { 
                                    ledger.transactionType === "sale" || 
                                    ledger.transactionType === "wholesale_sale" || 
                                    ledger.transactionType === "fix_sale" || 
                                    ledger.transactionType === "unfix_sale" || 
                                    ledger.transactionType === "stock_out" 
                                    ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                  }
                                </TableCell>
                                </>
                              )}
                            </>
                          )}

                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                              { 
                                ledger.transactionType === "capital_out" || 
                                ledger.transactionType === "advance_payment" || 
                                ledger.transactionType === "advance_received_deduct" ||
                                ledger.transactionType === "withdraw" ||
                                ledger.transactionType === "premium_paid"
                                ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                              }
                            </TableCell>
                            <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                              { 
                                ledger.transactionType === "capital_in" || 
                                ledger.transactionType === "advance_received" || 
                                ledger.transactionType === "advance_payment_deduct" ||
                                ledger.transactionType === "deposit" ||
                                ledger.transactionType === "premium_received"
                                ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                              }
                            </TableCell>
                            </>
                          )}

                          <TableCell className="border border-gray-300 text-center px-2 py-2">
                            {ledger.cumulativeBalances.map(([currency, balance]) => <div key={currency}>{currency} {balance.toFixed(2)}</div>)}
                          </TableCell>
                          
                        </TableRow>
                      ))
                    )}
                  </TableBody>

                  <TableFooter className="border-separate border-spacing-y-2 text-black text-sm dark:bg-gray-800 mt-4">
                    {Object.entries(ledgerTotalsByCurrency).map(([currency, totals]) => (
                      <Fragment key={currency}>
                        <TableRow>
                          <TableCell className="text-center px-2 py-2">{""}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          
                          <TableCell isHeader className="text-center px-2 py-2">{currency}</TableCell>
                            
                          <TableCell className="border border-gray-500 text-center">
                            Total:
                          </TableCell>
                          
                                
                          {(ledgerType === "purchase" || ledgerType === "all") && (
                            <>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.purchaseDebit.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 text-center px-2 py-2">{totals.purchaseCredit.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.purchaseStockDebit.toFixed(2)}</TableCell>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 text-center px-2 py-2">{totals.purchaseStockCredit.toFixed(2)}</TableCell>
                              </>
                            )}
                            </>
                          )}

                          {(ledgerType === "sale" || ledgerType === "all") && (
                            <>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.saleDebit.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 text-center px-2 py-2">{totals.saleCredit.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.saleStockDebit.toFixed(2)}</TableCell>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 text-center px-2 py-2">{totals.saleStockCredit.toFixed(2)}</TableCell>
                              </>
                            )}
                            </>
                          )}
                          
                          
                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                              <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.advanceDebit.toFixed(2)}</TableCell>
                              <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 text-center px-2 py-2">{totals.advanceCredit.toFixed(2)}</TableCell>
                            </>
                          )}

                          <TableCell className="border border-gray-500 text-center border-l border-gray-500 text-center px-2 py-2">{totals.closeBalance.toFixed(2)}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell isHeader colSpan={7} className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell className="border border-gray-500 text-center">Balance:</TableCell>

                          {(ledgerType === "purchase" || ledgerType === "all") && (
                            <>
                            <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseBalance > 0 ? "text-green-700" : totals.purchaseBalance < 0 ? "text-red-600" : ""}`}>{totals.purchaseBalance.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseStockBalance < 0 ? "text-red-600" : totals.purchaseStockBalance > 0 ? "text-green-700" : ""}`}>{totals.purchaseStockBalance.toFixed(2)}</TableCell>
                              </>
                            )}
                            </>
                          )}
                           
                          {(ledgerType === "sale" || ledgerType === "all") && (
                            <>
                            <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleBalance < 0 ? "text-red-600" : totals.saleBalance > 0 ? "text-green-700" : ""}`}>{totals.saleBalance.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleStockBalance > 0 ? "text-green-700" : totals.saleStockBalance < 0 ? "text-red-600" : ""}`}>{totals.saleStockBalance.toFixed(2)}</TableCell>
                              </>
                            )}
                            </>
                          )}
                          

                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.advanceBalance < 0 ? "text-red-600" : totals.advanceBalance > 0 ? "text-green-700" : ""}`}>{totals.advanceBalance.toFixed(2)}</TableCell>
                          )}

                          <TableCell colSpan={2} className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.closeBalance < 0 ? "text-red-600" : totals.closeBalance > 0 ? "text-green-700" : ""}`}>{totals.closeBalance.toFixed(2)}</TableCell>
                        </TableRow>
                      </Fragment>
                    ))}  
                  </TableFooter>
                  
                </Table>
              
              </div>

            </div>
            )}
          
        </div>
      }
    </>
  );
}
