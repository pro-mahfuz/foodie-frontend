import { Fragment, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectStockStatus,
  selectStockReport
} from "../../stock/features/stockSelectors.ts";
import { getStockReport } from "../../stock/features/stockThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function StockReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerId = Number(searchParams.get("containerId")) || 0;

  useEffect(() => {
    dispatch(getStockReport());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectStockStatus);
  const stockReports = useSelector(selectStockReport);
  const categories = useSelector(selectAllCategory);
  const visibleReports = stockReports.filter((stock) =>
    containerId
      ? Number(stock.containerId) === containerId
      : Number(stock.totalIn) - Number(stock.totalOut) - Number(stock.totalDamaged) > 0
  );
  const selectedContainerNo = visibleReports[0]?.container?.containerNo;
  const totalProfitLoss = visibleReports.reduce((total, stock) => total + stock.profitLoss, 0);
  const hasTotalProfitLoss = Math.round(totalProfitLoss * 100) !== 0;
  

  return (
    <>
      <PageMeta
        title={containerId ? "Container Item Report" : "Stock Report"}
        description="Stock Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={containerId ? "Container Item Report" : "Stock Report"} />

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
                        {containerId ? `Container Item Report${selectedContainerNo ? ` - ${selectedContainerNo}` : ''}` : 'Stock Report'}
                    </h6>
                  </div>
                </div>
              </div>
            

              <h6 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Stock Summary</h6>
              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Container</TableCell>
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Purchase</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sales</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Damaged</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Balance</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={9} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : visibleReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleReports.map((stock, index) => (
                      <TableRow key={index} className="border border-gray-500 dark:border-white/[0.05]">
                        <TableCell className="text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </TableCell>
                        
                        {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {stock.container?.containerNo}
                          </TableCell>
                        )}
                        
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {stock.item?.name}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {stock.unit?.toUpperCase()}
                        </TableCell>
                        
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {stock.totalIn.toFixed(2)}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {stock.totalOut.toFixed(2)}
                        </TableCell>
                        
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {stock.totalDamaged.toFixed(2)}
                        </TableCell>
                        
                        <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {(stock.totalIn - stock.totalOut - stock.totalDamaged).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {containerId && (
                <div className="mt-8">
                  <h6 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">Profit / Loss Summary</h6>
                  <Table>
                    <TableHeader className="border border-gray-500 bg-gray-200 text-black text-sm dark:border-white/[0.05] dark:bg-gray-800 dark:text-gray-400">
                      <TableRow>
                        <TableCell isHeader className="border border-gray-500 px-2 py-1 text-center">Sl</TableCell>
                        <TableCell isHeader className="border border-gray-500 px-2 py-1">Particulars</TableCell>
                        <TableCell isHeader className="border border-gray-500 px-2 py-1 text-center">Debit</TableCell>
                        <TableCell isHeader className="border border-gray-500 px-2 py-1 text-center">Credit</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {visibleReports.map((stock, index) => (
                        <Fragment key={`${stock.itemId}-${stock.unit}-${index}`}>
                          <TableRow className="border border-gray-500 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.04]"><TableCell colSpan={4} className="border border-gray-500 px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{index + 1}. {stock.item?.name} ({stock.unit?.toUpperCase()})</TableCell></TableRow>
                          <TableRow className="border border-gray-500 dark:border-white/[0.05]"><TableCell className="border border-gray-500 px-2 py-1 text-center text-sm text-gray-400">{index + 1}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-sm text-gray-500 dark:text-gray-400">Purchase: {stock.totalIn.toFixed(2)} x {stock.itemRate.toFixed(2)}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right text-sm text-gray-600 dark:text-gray-300">{stock.purchaseValue.toFixed(2)}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right">-</TableCell></TableRow>
                          <TableRow className="border border-gray-500 dark:border-white/[0.05]"><TableCell className="border border-gray-500 px-2 py-1"> </TableCell><TableCell className="border border-gray-500 px-2 py-1 text-sm text-gray-500 dark:text-gray-400">Sales: {stock.totalOut.toFixed(2)} x {stock.averageSaleRate.toFixed(2)}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right">-</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right text-sm text-gray-600 dark:text-gray-300">{stock.saleValue.toFixed(2)}</TableCell></TableRow>
                          <TableRow className="border border-gray-500 dark:border-white/[0.05]"><TableCell className="border border-gray-500 px-2 py-1"> </TableCell><TableCell className="border border-gray-500 px-2 py-1 text-sm text-gray-500 dark:text-gray-400">Expenses{stock.expenseDescription ? `: ${stock.expenseDescription}` : ''}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right text-sm text-gray-600 dark:text-gray-300">{stock.otherExpense.toFixed(2)}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right">-</TableCell></TableRow>
                          <TableRow className="border border-gray-500 font-semibold dark:border-white/[0.05]"><TableCell className="border border-gray-500 px-2 py-1"> </TableCell><TableCell className="border border-gray-500 px-2 py-1 text-sm">Total {stock.profitLoss >= 0 ? 'Profit' : 'Loss'}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right text-sm">{stock.profitLoss < 0 ? Math.abs(stock.profitLoss).toFixed(2) : '-'}</TableCell><TableCell className="border border-gray-500 px-2 py-1 text-right text-sm">{stock.profitLoss >= 0 ? stock.profitLoss.toFixed(2) : '-'}</TableCell></TableRow>
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                  {hasTotalProfitLoss && (
                    <div className={`mt-3 flex justify-end border-t border-gray-300 pt-3 text-sm font-semibold dark:border-gray-700 ${totalProfitLoss > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Total Profit / Loss: {totalProfitLoss.toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
}
