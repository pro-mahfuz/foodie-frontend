import { useMemo, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectPaymentStatus,
  selectPurchaseCashPaymentReport
} from "../../payment/features/paymentSelectors.ts";
import { fetchAll } from "../../payment/features/paymentThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";

export default function PurchaseCashPaymentReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    dispatch(fetchAll());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectPaymentStatus);

  const saleCollectionSelector = useMemo(
    () => selectPurchaseCashPaymentReport(fromDate, toDate),
    [fromDate, toDate]
  );

  const { payments, previousTotal, currentTotal, total } = useSelector(saleCollectionSelector);


  return (
    <>
      <PageMeta
        title="Payment Collection Report"
        description="Payment Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Sale Collection Report" />

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
                        Payment Transaction Report
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
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Payment No</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Invoice No</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Payment Type</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Customer Name</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Amount</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    <TableRow className="text-sm">
                      <TableCell isHeader colSpan={6} className="border border-gray-500 text-center px-4 py-1">Opening Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{previousTotal.length > 0 ? previousTotal.map(p => p.currency + ": " + p.amount.toFixed(2)).join(",  ") : "0.00"}</TableCell>
                    </TableRow>
                    {payments.map((payment, index) => (
                      <TableRow key={payment.id ?? index} className="border border-gray-500">
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {payment?.paymentDate}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {payment.paymentRefNo}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {payment.invoiceRefNo}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {payment.paymentType}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {payment.party?.name}
                        </TableCell>
                        <TableCell className="text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400 flex justify-between gap-2">
                            <div>{"(" + payment.currency + ")" }</div>
                            <div>{payment.amountPaid}</div> 
                        </TableCell>

                      </TableRow>
                    ))}


                    <TableRow className="text-sm">
                      <TableCell isHeader colSpan={6} className="border border-gray-500 text-center px-4 py-1">Current Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">
                        {currentTotal.map(c => <div className="flex justify-between">
                            <div>{c.currency}</div>
                            <div>{c.amount.toFixed(2)}</div>
                        </div>)}
                      </TableCell>
                    </TableRow>
                    </>
                  )}
                </TableBody>
                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader colSpan={6} className="border border-gray-500 text-center px-4 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1 ">
                        {total.map(c => <div className="flex justify-between">
                            <div>{c.currency}</div>
                            <div>{c.amount.toFixed(2)}</div>
                        </div>)}
                    </TableCell>
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
