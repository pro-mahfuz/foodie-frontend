import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
//import DatePicker from "../../../components/form/date-picker.tsx";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectInvoiceStatus,
  selectCustomerOutstandingReport
} from "../../invoice/features/invoiceSelectors.ts";
import { getSalePaymentReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function SaleOutstandingReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const formattedDate = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  const [fromDate] = useState(formattedDate);

  useEffect(() => {
    dispatch(getSalePaymentReport());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const salePaymentReports = useSelector(selectCustomerOutstandingReport);

  // ✅ FILTERED DATA (what is actually shown)
  const outstandingReports = useMemo(() => {
    return salePaymentReports.filter(
      r => round2(Number(r.totalDue)) > 0
    );
  }, [salePaymentReports]);

  // ✅ CORRECT TOTAL SUMMARY (sum of visible rows)
  const totalOutstanding = useMemo(() => {
    return outstandingReports.reduce((sum, r) => {
      return round2(sum + Number(r.totalDue));
    }, 0);
  }, [outstandingReports]);

  return (
    <>
      <PageMeta
        title="Customer Outstanding Report"
        description="Payment Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Customer Outstanding" />

      <div className="flex justify-end print:hidden mb-2">
        {/* <div className="flex">
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
        </div> */}

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
                        Customer Outstanding Report
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                      { fromDate ? "Date: " + fromDate : "" }
                    </h6>
                    
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Customer</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Amount (Outstanding)</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : outstandingReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    outstandingReports.map((invoice, index) => (
                      <TableRow key={index}>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.customer}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {round2(Number(invoice.totalDue)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader colSpan={2} className="border border-gray-500 text-center px-4 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{totalOutstanding.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
