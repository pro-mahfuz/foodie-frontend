import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectInvoiceStatus,
  selectDailyProfitLossReportByDate
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleReport, getDailyProfitLossReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { Link } from "react-router";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function DailyProfitLossReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    dispatch(getSaleReport());
    dispatch(getDailyProfitLossReport());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);

  const profitLossReports = useSelector(selectDailyProfitLossReportByDate(fromDate, toDate));


  const { data = [], previousProfit = [], currentProfit = [], totalProfit = [] } = profitLossReports || {};

  return (
    <>
      <PageMeta
        title="Daily Profit & Loss Report"
        description="Sale Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Daily Profit & Loss" />

      {/* Print Button */}
      <div className="flex justify-between print:hidden mb-2">
        <div className="flex">
          <div>
            <DatePicker
              id="from-date"
              label=""
              placeholder="From Date"
              onChange={(dates, currentDateString) => {
                  console.log({ dates, currentDateString });
                  setFromDate(currentDateString);
              }}
            />
          </div>
          <div className="ml-2">
            <DatePicker
              id="to-date"
              label=""
              placeholder="To Date"
              onChange={(dates, currentDateString) => {
                  console.log({ dates, currentDateString });
                  setToDate(currentDateString);
              }}
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
                        Daily Profit & Loss Report
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                      { fromDate && toDate ? "Date: " + fromDate + " to " + toDate : "" }
                      { !fromDate && toDate ? "Date: " + toDate : "" }
                      { fromDate && !toDate ? "Date: " + fromDate : "" }
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Date</TableCell>
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
                  {status === "loading" ? (
                    <TableRow>
                      <TableCell colSpan={11 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    {previousProfit.map((p) => (
                        <TableRow className="border border-gray-500 text-sm">
                          <TableCell isHeader colSpan={10 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-right px-2 py-1">Opening Summary: </TableCell>
                          <TableCell isHeader className="text-center px-2 py-1 flex flex-row justify-between">
                            <div>{p.currency}</div>
                            <div>{(p.amount).toFixed(2)}</div>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                    {
                      data.map((item, index) => (
                        <TableRow>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.date}
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
                        <TableCell isHeader colSpan={10 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-right px-2 py-1">Current Summary: </TableCell>
                        <TableCell isHeader className="text-center px-2 py-1">
                        {currentProfit.map((p) => (
                          <div className="flex flex-row justify-between">
                            <div>{p.currency}</div>
                            <div>{(p.amount).toFixed(2)}</div>
                          </div>
                        ))}
                        </TableCell>
                      </TableRow>
                    
                  
                      <TableRow className="border border-gray-500 text-sm">
                        <TableCell isHeader colSpan={10 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-right px-2 py-1">Total Summary: </TableCell>
                        <TableCell isHeader className="text-center px-2 py-1">
                        {totalProfit.map((p) => (
                          <div className="flex flex-row justify-between">
                            <div>{p.currency}</div>
                            <div>{(p.amount).toFixed(2)}</div>
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
