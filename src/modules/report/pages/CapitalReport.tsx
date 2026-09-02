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
import { fetchAssetStatement } from "../../account/features/accountThunks.ts";
import { selectAssetStatement } from "../../account/features/accountSelectors.ts";
import { selectDailyProfitLossReport } from "../../invoice/features/invoiceSelectors.ts";
import { getDailyProfitLossReport } from "../../invoice/features/invoiceThunks.ts";

export default function CapitalReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllCategory());
    dispatch(fetchAssetStatement());
    dispatch(fetchAllCategory());
    dispatch(getDailyProfitLossReport());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectStockStatus);
  const balanceReports = useSelector(selectAssetStatement);
  const profitLossReports = useSelector(selectDailyProfitLossReport);

  const totalProfitLossReports = useMemo(() => {
    const grouped = profitLossReports.reduce((acc, item) => {
      const currency = item.currency || "Unknown";
      const profitLoss = item.profitLoss;

      // initialize currency bucket if not exist
      if (!acc[currency]) {
        acc[currency] = { currency, profitLoss: 0 };
      }

      acc[currency].profitLoss += profitLoss;

      return acc;
    }, {} as Record<string, { currency: string; profitLoss: number }>);

    // convert object → array
    return Object.values(grouped);
  }, [profitLossReports]);

  const totalBalanceByCurrency = useMemo(() => {
    // group profit/loss by currency first
    const profitLossByCurrency = totalProfitLossReports.reduce((acc, p) => {
      if (!p.currency) return acc;
      acc[p.currency] = (acc[p.currency] ?? 0) + (Number(p.profitLoss) || 0);
      return acc;
    }, {} as Record<string, number>);



    return balanceReports.reduce((acc, { currency, openingBalance, capitalInSum, capitalOutSum, expenseOutSum, containerExpenseOutSum }) => {
      if (!currency) return acc;

      if (!acc[currency]) {
        acc[currency] = {
          openingAmount: 0,
          capitalIn: 0,
          capitalOut: 0,
          profitLoss: 0,
          expenseOut: 0,
          containerExpenseOut: 0,
        };
      }

      acc[currency].openingAmount += Number(openingBalance) || 0;
      acc[currency].capitalIn += Number(capitalInSum ?? 0);
      acc[currency].capitalOut += Number(capitalOutSum ?? 0);
      acc[currency].expenseOut += Number(expenseOutSum ?? 0);
      acc[currency].containerExpenseOut += Number(containerExpenseOutSum ?? 0);

      // attach grouped profit/loss once
      acc[currency].profitLoss = profitLossByCurrency[currency] ?? 0;

      return acc;
    }, {} as Record<string, {
      openingAmount: number;
      capitalIn: number;
      capitalOut: number;
      profitLoss: number;
      expenseOut: number;
      containerExpenseOut: number;
    }>);
  }, [balanceReports, profitLossReports]);

  return (
    <>
      <PageMeta
        title="Capital Statement"
        description="Stock Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Capital Statement" />

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
                        Capital Statement
                    </h6>
                  </div>
                </div>
              </div>
            

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow className="border border-gray-500">
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Currency</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Initial Capital</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Capital</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Drawings</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+/-) Profit/Loss</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(-) Expense</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">(+) Total Capital</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : balanceReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {Object.entries(totalBalanceByCurrency).map(([currency, totals]) => (
                        <TableRow className="border border-gray-500 dark:border-white/[0.05]">
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {currency}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {totals.openingAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {totals.capitalIn.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {totals.capitalOut.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {totals.profitLoss.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {(totals.expenseOut + totals.containerExpenseOut).toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {(totals.openingAmount + totals.capitalIn + (totals.profitLoss) - totals.capitalOut - totals.expenseOut - totals.containerExpenseOut).toFixed(2)}
                          </TableCell>
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
