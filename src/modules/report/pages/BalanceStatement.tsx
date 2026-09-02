import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectStockStatus } from "../../stock/features/stockSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchBalanceStatement } from "../../account/features/accountThunks.ts";
import { selectBalanceStatement } from "../../account/features/accountSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";

export default function BalanceStatement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllCategory());
    dispatch(fetchBalanceStatement());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectStockStatus);
  const balanceReports = useSelector(selectBalanceStatement);
  const categories = useSelector(selectAllCategory);
  console.log("BalanceReport: ", balanceReports);

  const totalBalanceByCurrency = useMemo(() => {
    return balanceReports.reduce((acc, { 
      currency, openingBalance, stockInSum, stockOutSum, paymentInSum, paymentOutSum, 
      capitalInSum, capitalOutSum, advanceInSum, advanceOutSum, expenseOutSum, containerExpenseOutSum, billOutSum
    }) => {
      if (!currency) return acc;

      if (!acc[currency]) {
        acc[currency] = {
          openingAmount: 0,
          stockIn: 0,
          stockOut: 0,
          stockBalance: 0,
          paymentIn: 0,
          paymentOut: 0,
          capitalIn: 0,
          capitalOut: 0,
          advanceIn: 0,
          advanceOut: 0,
          expenseOut: 0,
          containerExpense: 0,
          billOut: 0,
          paymentBalance: 0,
          balance: 0,
          cashIn: 0,
          cashOut: 0
        };
      }

      acc[currency].openingAmount += Number(openingBalance) || 0;
      acc[currency].stockIn += Number(stockInSum) || 0;
      acc[currency].stockOut += Number(stockOutSum) || 0;
      acc[currency].stockBalance += (Number(stockInSum) - Number(stockOutSum)) || 0;
      acc[currency].paymentIn += Number(paymentInSum) || 0;
      acc[currency].paymentOut += Number(paymentOutSum) || 0;
      acc[currency].capitalIn += Number(capitalInSum) || 0;
      acc[currency].capitalOut += Number(capitalOutSum) || 0;
      acc[currency].advanceIn += Number(advanceInSum) || 0;
      acc[currency].advanceOut += Number(advanceOutSum) || 0;
      acc[currency].expenseOut += Number(expenseOutSum) || 0;
      acc[currency].containerExpense += Number(containerExpenseOutSum) || 0;
      acc[currency].billOut += Number(billOutSum) || 0;
      acc[currency].paymentBalance += (Number(paymentInSum) - Number(paymentOutSum)) || 0;
      acc[currency].balance += Number(openingBalance) + Number(stockInSum) - Number(stockOutSum) + Number(paymentInSum) - Number(paymentOutSum) || 0;

      acc[currency].cashIn += (Number(openingBalance ?? 0) + Number(capitalInSum ?? 0) + Number(advanceInSum ?? 0) + Number(stockInSum ?? 0) + Number(paymentInSum ?? 0));
      acc[currency].cashOut += (Number(capitalOutSum ?? 0) + Number(advanceOutSum ?? 0) + Number(stockOutSum ?? 0) + Number(paymentOutSum ?? 0) + Number(expenseOutSum ?? 0) + Number(containerExpenseOutSum ?? 0) + Number(billOutSum ?? 0));

      return acc;
    }, {} as Record<string, {
      openingAmount: number;
      stockIn: number;
      stockOut: number;
      stockBalance: number;
      paymentIn: number;
      paymentOut: number;
      capitalIn: number;
      capitalOut: number;
      advanceIn: number;
      advanceOut: number;
      expenseOut: number;
      containerExpense: number;
      billOut: number;
      paymentBalance: number;
      balance: number;
      cashIn: number;
      cashOut: number;
    }>);
  }, [balanceReports]);

  console.log("totalBalanceByCurrency", totalBalanceByCurrency);
  

  return (
    <>
      <PageMeta
        title="Balance Statement"
        description="Stock Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Balance Statement" />

      {/* Print Button */}
      <div className="mb-4 flex justify-end print:hidden">
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

      
      <div className="space-y-6">
        <div id="print-section">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full p-4">

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
                        Balance Statement
                    </h6>
                  </div>
                </div>
              </div>
            

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow className="border border-gray-500">
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Account Details</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Currency</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Opening Balance</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Capital</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Drawings</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Advance In</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Advance Paid</TableCell>
                    {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                      <>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Stock (In)</TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Stock (Out)</TableCell>
                      </>
                    )}

                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Payment (In)</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Payment (Out)</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Bill</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Exense (Container)</TableCell>
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Exense</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Balance</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={15} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : balanceReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {balanceReports.map((balance, index) => (
                        <TableRow key={index} className="border border-gray-500 dark:border-white/[0.05]">
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </TableCell>
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {balance.accountName}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {balance.currency}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.openingBalance) > 0 ? Number(balance.openingBalance).toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.capitalInSum) > 0 ? Number(balance.capitalInSum).toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.capitalOutSum) > 0 ? Number(balance.capitalOutSum).toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.advanceInSum) > 0 ? Number(balance.advanceInSum).toFixed(2) : '-'}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.advanceOutSum) > 0 ? Number(balance.advanceOutSum).toFixed(2) : '-'}
                          </TableCell>

                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(balance.stockInSum) > 0 ? Number(balance.stockInSum).toFixed(2) : "-"}
                              </TableCell>
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(balance.stockOutSum) > 0 ? Number(balance.stockOutSum).toFixed(2) : "-"}
                              </TableCell>
                            </>
                          )}
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.paymentInSum) > 0 ? Number(balance.paymentInSum).toFixed(2) : "-"}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.paymentOutSum) > 0 ? Number(balance.paymentOutSum).toFixed(2) : "-"}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.billOutSum) > 0 ? Number(balance.billOutSum).toFixed(2) : "-"}
                          </TableCell>

                          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {Number(balance.containerExpenseOutSum) > 0 ? Number(balance.containerExpenseOutSum).toFixed(2) : "-"}
                            </TableCell>
                          )}

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(balance.expenseOutSum) > 0 ? Number(balance.expenseOutSum).toFixed(2) : "-"}
                          </TableCell>
                          
                          <TableCell className="font-semibold text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 flex justify-between gap-2">
                            <div>{"(" + balance.currency + ")" }</div>
                            <div>{(Number(balance.openingBalance ?? 0) + Number(balance.capitalInSum ?? 0) - Number(balance.capitalOutSum ?? 0) + Number(balance.advanceInSum ?? 0) - Number(balance.advanceOutSum ?? 0) + (Number(balance.stockInSum ?? 0) - Number(balance.stockOutSum ?? 0)) + (Number(balance.paymentInSum ?? 0) - Number(balance.paymentOutSum ?? 0)) - Number(balance.expenseOutSum ?? 0) - Number(balance.containerExpenseOutSum ?? 0) - Number(balance.billOutSum ?? 0)).toFixed(2)}</div> 
                          </TableCell>
                        </TableRow>
                      ))}

                      {Object.entries(totalBalanceByCurrency).map(([currency, totals]) => (
                        <TableRow>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{""}</TableCell>
                          <TableCell isHeader className="text-center px-2 py-2">{currency}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.openingAmount.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.capitalIn.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.capitalOut.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.advanceIn.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.advanceOut.toFixed(2)}</TableCell>
                          {categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <>
                            <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.stockIn.toFixed(2)}</TableCell>
                            <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{totals.stockOut.toFixed(2)}</TableCell>
                            </>
                          )}
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center px-2 py-2">{totals.paymentIn.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{totals.paymentOut.toFixed(2)}</TableCell>

                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{totals.billOut.toFixed(2)}</TableCell>
                          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{totals.containerExpense.toFixed(2)}</TableCell>
                          )}
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{totals.expenseOut.toFixed(2)}</TableCell>
                          <TableCell className="border border-gray-500 bg-gray-200 font-semibold text-center border-l border-gray-500 text-center px-2 py-2">{(totals.cashIn - totals.cashOut).toFixed(2)}</TableCell>

                        </TableRow>
                      ))}  
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}
