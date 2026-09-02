import { useMemo, useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import Select from "react-select";
import { selectStyles } from "../../types.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll } from "../../ledger/features/ledgerThunks.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAccountLedgers, selectLedgerStatus } from "../../ledger/features/ledgerSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
// import { useNavigate } from "react-router-dom";


export default function AccountStatement() {
  const { partyId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const partyID = Number(partyId) ?? 0;
  const businessID = Number(user?.business?.id) ?? 0;

  const [bankId, setBankId] = useState(0);

  useEffect(() => {
    dispatch(fetchAll());
    dispatch(fetchAllCategory());
    dispatch(fetchAllAccount());
  }, [dispatch]);

  const status = useSelector(selectLedgerStatus);
  const ledgers = useSelector(selectAccountLedgers(businessID, partyID, 0, bankId));
  const categories = useSelector(selectAllCategory);
  const paymentAccounts = useSelector(selectAllAccount);


  // Sort ledgers
  const sortedLedgers = useMemo(() => {
    return [...ledgers].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB; // ASC by date
      return (b.id || 0) - (a.id || 0); // fallback by id DESC
    });
  }, [ledgers]);

  // Compute cumulative balance for all ledgers
  const ledgersWithBalance = useMemo(() => {
    let cumulative = 0;
    return sortedLedgers.map((ledger) => {
      cumulative += Number(ledger.runningBalance ?? 0);
      return {
        ...ledger,
        cumulativeBalance: cumulative,
      };
    });
  }, [sortedLedgers]);


  // Totals by currency
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
    return sortedLedgers.reduce<Record<string, CurrencyTotals>>((totals, ledger) => {
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
        ["clearance_bill", "payment_out", "stock_in", "discount_purchase"].includes(ledger.transactionType)
      ) {
        current.purchaseDebit += debit;
        current.purchaseCredit += credit;
        current.purchaseStockDebit += debitQty;
        current.purchaseStockCredit += creditQty;
      }

      if (
        ["payment_in", "stock_out", "discount_sale"].includes(ledger.transactionType)
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
  }, [sortedLedgers]);

  return (
    <>
      <PageMeta
        title="Account Statement"
        description="Account Statement with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`Account Statement`} />

      <div className="flex justify-between print:hidden mb-2">
        <div className="flex">
          <div>
            {/* <Label>Select Payment Account</Label> */}
            <Select
              options={
              paymentAccounts
                  .map((b) => ({
                      label: `${b.accountName}`,
                      value: b.id,
                  })) || []
              }
              placeholder="Select Stock Accounts"
              value={
                  paymentAccounts
                  ?.filter((b) => b.id === bankId)
                  .map((b) => ({ label: b.accountName, value: b.id }))[0] || null
              }
              onChange={(selectedOption) =>
                  setBankId(selectedOption?.value ?? 0)
              }
              isClearable
              styles={selectStyles}
              classNamePrefix="react-select"
              required
            />
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
          >
            Back
          </button>

          <button
            onClick={() => window.print()}
            className="bg-purple-600 text-white px-2 py-1 rounded-full hover:bg-purple-900"
          >
            Print Report
          </button>
        </div>
      </div>
      

      <div id="print-section">
        <div className="space-y-6">
          
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Search Input */}
            {/* <SearchControl value={filterText} onChange={setFilterText} /> */}
            
            <div className="max-w-full overflow-x-hidden">
              <div className="p-5 rounded-2xl lg:p-6">
                <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                  <div className="flex flex-col items-center w-full gap-1">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {user?.business?.businessName}
                    </h4>
                    {user?.business?.trnNo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            TRN No: {user.business.trnNo}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Address: {user?.business?.address} , Email: {user?.business?.email} , Phone: {(user?.business?.phoneCode ?? '') + user?.business?.phoneNumber}
                    </p>
                    <h6 className="border border-gray-500 p-1 rounded text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        Account Statement
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        { bankId ? "Account Name: " + paymentAccounts.find(p => p.id === bankId)?.accountName : "" }
                    </h6>
                  </div>
                </div>
              </div>

              {
                bankId ? (
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
                        <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                        

                        <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Purchase</TableCell>
                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Purchase Stock</TableCell>
                        )}
                        <TableCell colSpan={2} className="border border-gray-500 text-center px-2 py-2 font-semibold">Sale</TableCell>
                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Sale Stock</TableCell>
                        )}
                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <TableCell colSpan={2} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Advance</TableCell>
                        )}

                        
                        <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">{""}</TableCell>
                        
                      </TableRow>

                      <TableRow>
                        <TableCell isHeader className="text-center px-2 py-2">Sl</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Transaction</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Reference</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Date</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Party Name</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Description</TableCell>
                        
                        <TableCell isHeader className="text-center px-2 py-2">Account</TableCell>
                        <TableCell isHeader className="text-center px-2 py-2">Item/ Currency</TableCell>

                        <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
                        <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>
                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
                          </>
                        )}
                        <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Debit</TableCell>
                        <TableCell colSpan={1} className="border border-gray-500 text-center px-2 py-2 font-semibold">Credit</TableCell>

                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Credit</TableCell>
                          </>
                        )}

                        {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                          <>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Debit</TableCell>
                          <TableCell colSpan={1} className="border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold">Credit</TableCell>
                          </>
                        )}
                        <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2 font-semibold">Balance</TableCell>

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
                                
                                { (index + 1) }
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
                                {ledger.currency}
                              </TableCell>

                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { ledger.transactionType === "purchase" || ledger.transactionType === "clearance_bill" || 
                                  ledger.transactionType === "wholesale_purchase" || ledger.transactionType === "fix_purchase" || 
                                  ledger.transactionType === "unfix_purchase" || ledger.transactionType === "payment_out" || 
                                  ledger.transactionType === "clearance_bill" || ledger.transactionType === "discount_purchase" 
                                  ? ledger.debit > 0 ? ledger.debit : "-" : "-"
                                }
                              </TableCell>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">{ ledger.transactionType === "purchase" || ledger.transactionType === "clearance_bill" || ledger.transactionType === "wholesale_purchase" || ledger.transactionType === "fix_purchase" || ledger.transactionType === "unfix_purchase" || ledger.transactionType === "clearance_bill" || ledger.transactionType === "discount_purchase" ? ledger.credit > 0 ? ledger.credit : "-" : "-" }</TableCell>
                              
                              {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                <>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { ledger.transactionType === "purchase" || ledger.transactionType === "clearance_bill" || 
                                  ledger.transactionType === "wholesale_purchase" || ledger.transactionType === "fix_purchase" || 
                                  ledger.transactionType === "unfix_purchase" || ledger.transactionType === "stock_in" 
                                  ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                  }
                                </TableCell>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { ledger.transactionType === "purchase" || ledger.transactionType === "clearance_bill" || 
                                  ledger.transactionType === "wholesale_purchase" || ledger.transactionType === "fix_purchase" || 
                                  ledger.transactionType === "unfix_purchase" || ledger.transactionType === "stock_in" 
                                  ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                  }
                                </TableCell>
                                </>
                              )}

                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { ledger.transactionType === "sale" || ledger.transactionType === "wholesale_sale" || 
                                ledger.transactionType === "fix_sale" || ledger.transactionType === "unfix_sale" || 
                                ledger.transactionType === "discount_sale" 
                                ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                                }
                              </TableCell>
                              <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                { ledger.transactionType === "sale" || ledger.transactionType === "wholesale_sale" || 
                                ledger.transactionType === "fix_sale" || ledger.transactionType === "unfix_sale" || 
                                ledger.transactionType === "payment_in" || ledger.transactionType === "discount_sale" 
                                ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                                }
                              </TableCell>
                              
                              {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                <>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { ledger.transactionType === "sale" || ledger.transactionType === "wholesale_sale" || 
                                  ledger.transactionType === "fix_sale" || ledger.transactionType === "unfix_sale" || 
                                  ledger.transactionType === "stock_out" 
                                  ? ledger.debitQty > 0 ? ledger.debitQty : "-" : "-" 
                                  }
                                </TableCell>
                                <TableCell className="border border-gray-300 bg-gray-50 text-center px-2 py-2">
                                  { ledger.transactionType === "sale" || ledger.transactionType === "wholesale_sale" || 
                                  ledger.transactionType === "fix_sale" || ledger.transactionType === "unfix_sale" || 
                                  ledger.transactionType === "stock_out" 
                                  ? ledger.creditQty > 0 ? ledger.creditQty : "-" : "-" 
                                  }
                                </TableCell>
                                </>
                              )}

                              {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                                <>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                  { ledger.transactionType === "capital_out" || ledger.transactionType === "advance_payment" || 
                                  ledger.transactionType === "advance_received_deduct" || ledger.transactionType === "premium_paid" || 
                                  ledger.transactionType === "withdraw" 
                                  ? ledger.debit > 0 ? ledger.debit : "-" : "-" 
                                  }
                                </TableCell>
                                <TableCell className="border border-gray-300 bg-gray-200 text-center px-2 py-2">
                                  { ledger.transactionType === "capital_in" || ledger.transactionType === "advance_received" || 
                                  ledger.transactionType === "advance_payment_deduct" || ledger.transactionType === "premium_paid" || 
                                  ledger.transactionType === "withdraw" 
                                  ? ledger.credit > 0 ? ledger.credit : "-" : "-" 
                                  }
                                </TableCell>
                                </>
                              )}

                            
                                <TableCell className="border border-gray-300 text-center px-2 py-2">
                                  {ledger.cumulativeBalance.toFixed(2)}
                                </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>

                    {Object.entries(ledgerTotalsByCurrency).map(([currency, totals]) => (
                        <TableFooter key={`footer-${currency}`} className="border-separate border-spacing-y-2 text-black text-sm dark:bg-gray-800 mt-4">
                          <TableRow><TableCell className="text-center px-2 py-2">{""}</TableCell></TableRow>
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
                            
                                  
                            <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.purchaseDebit.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 text-center px-2 py-2">{totals.purchaseCredit.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.purchaseStockDebit.toFixed(2)}</TableCell>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 text-center px-2 py-2">{totals.purchaseStockCredit.toFixed(2)}</TableCell>
                              </>
                            )}
                            <TableCell className="border border-gray-500 bg-gray-200 text-center px-2 py-2">{totals.saleDebit.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 bg-gray-200 text-center border-l border-gray-500 text-center px-2 py-2">{totals.saleCredit.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center px-2 py-2">{totals.saleStockDebit.toFixed(2)}</TableCell>
                              <TableCell className="border border-gray-500 bg-gray-50 text-center border-l border-gray-500 text-center px-2 py-2">{totals.saleStockCredit.toFixed(2)}</TableCell>
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
                            <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseBalance > 0 ? "text-green-700" : totals.purchaseBalance < 0 ? "text-red-600" : ""}`}>{totals.purchaseBalance.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.purchaseStockBalance < 0 ? "text-red-600" : totals.purchaseStockBalance > 0 ? "text-green-700" : ""}`}>{totals.purchaseStockBalance.toFixed(2)}</TableCell>
                              </>
                            )}
                            <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleBalance < 0 ? "text-red-600" : totals.saleBalance > 0 ? "text-green-700" : ""}`}>{totals.saleBalance.toFixed(2)}</TableCell>
                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <>
                              <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.saleStockBalance > 0 ? "text-green-700" : totals.saleStockBalance < 0 ? "text-red-600" : ""}`}>{totals.saleStockBalance.toFixed(2)}</TableCell>
                              </>
                            )}

                            {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                              <TableCell colSpan={2} className={`border border-gray-500 bg-gray-200 text-center px-2 py-2 font-semibold ${totals.advanceBalance < 0 ? "text-red-600" : totals.advanceBalance > 0 ? "text-green-700" : ""}`}>{totals.advanceBalance.toFixed(2)}</TableCell>
                            )}

                            
                            <TableCell colSpan={2} className={`border border-gray-500 text-center px-2 py-2 font-semibold ${totals.closeBalance < 0 ? "text-red-600" : totals.closeBalance > 0 ? "text-green-700" : ""}`}>{totals.closeBalance.toFixed(2)}</TableCell>
                          
                            
                          </TableRow>
                          
                        </TableFooter>
                    ))}  
                  </Table>
                ) : ""
              }

              
            
            </div>

            {/* Pagination Controls */}
            {/* <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            /> */}
          </div>
        </div>
      </div>

    </>
  );
}
