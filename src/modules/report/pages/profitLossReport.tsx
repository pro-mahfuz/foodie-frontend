import { useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectInvoiceStatus,
  selectAllProfitLossReport
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleReport, getProfitLossReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { Link } from "react-router";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
export default function ProfitLossReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getSaleReport());
    dispatch(getProfitLossReport());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);

  const profitLossReports = useSelector(selectAllProfitLossReport);

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

  return (
    <>
      <PageMeta
        title="Profit & Loss Report"
        description="Sale Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Profit & Loss" />

      {/* Print Button */}
      <div className="flex justify-between print:hidden mb-2">
        <div className="flex">
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
                        Profit & Loss Report
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Container No</TableCell>
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item Details</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Purchase Qty (Avg.)</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Purchase Amount (Avg.)</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Purchase Rate (Avg.)</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sale Rate</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sale Qty</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sell Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Profit/Loss</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : (profitLossReports?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    {
                      profitLossReports.map((item, index) => (
                        <TableRow>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                          </TableCell>
                          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              <Link to={`/report/sale/${item.containerNo!}`}>
                                {item.containerNo}
                              </Link>
                          </TableCell>
                          )}
            
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.itemName + " - " + item.itemUnit}
                          </TableCell>
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalPurchaseQty > 0 ? item.totalPurchaseQty : "-"}
                          </TableCell>
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.totalPurchaseAmount > 0 ? item.totalPurchaseAmount.toFixed(2) + " (" + (item.currency) + ")" : "-"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {item.avgPurchaseRate?.toFixed(2)}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.avgSaleRate?.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.saleQty > 0 ? item.saleQty : "-"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.saleAmount > 0 ? item.saleAmount.toFixed(2) + " (" + (item.currency) + ")" : "-"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.profitLoss.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    }

                        <TableRow className="border border-gray-500 text-sm">
                          <TableCell isHeader colSpan={9 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-right px-2 py-1">Total Summary: </TableCell>
                          <TableCell isHeader className="text-center px-2 py-1">
                          {Object.entries(totalProfitLossReports).map(([index, totals]) => (
                            <div key={index} className="flex flex-row justify-between">
                              <div>{totals.currency}</div>
                              <div>{(totals.profitLoss).toFixed(2)}</div>
                            </div>
                          ))}
                          </TableCell>
                        </TableRow>
                    
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
