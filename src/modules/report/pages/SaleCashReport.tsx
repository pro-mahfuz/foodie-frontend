import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectInvoiceStatus,
  selectSaleCashReport
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleCashReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";

export default function SaleCashReport() {
  const { containerNo } = useParams()
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    dispatch(fetchParty({ type: "all" }))
    dispatch(getSaleCashReport());
    dispatch(fetchAllCategory());
    dispatch(fetchAll());
  }, [dispatch, containerNo]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser?.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const saleCashReports = useSelector(selectSaleCashReport(fromDate, toDate));

  return (
    <>
      <PageMeta
        title="Sale Cash Report"
        description="Sale Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Sale Cash Report" />

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
                        Sale Cash Report
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
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Previous Outstanding</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sell Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Cash Received</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Outstanding Balance</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : saleCashReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {
                        saleCashReports.map((invoice, index) => (
                          <TableRow key={index}>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {invoice?.date}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(invoice?.previousDue).toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(invoice.saleAmount).toFixed(2)}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(invoice.cashReceived).toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center font-semibold px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {Number(invoice.dueAmount).toFixed(2)}
                            </TableCell>

                          </TableRow>
                        ))
                      }
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
