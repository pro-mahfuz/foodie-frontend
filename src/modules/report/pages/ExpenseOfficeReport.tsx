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
import DatePicker from "../../../components/form/date-picker.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectPaymentStatus,
  selectAllOfficeExpense
} from "../../payment/features/paymentSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { fetchAll } from "../../payment/features/paymentThunks.ts";

export default function ExpenseOfficeReport() {
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

  const expenseOfficeSelector = useMemo(
    () => selectAllOfficeExpense(fromDate, toDate),
    [fromDate, toDate]
  );
  const expenseOfficeReports = useSelector(expenseOfficeSelector);

  return (
    <>
      <PageMeta
        title="Office Expense Report"
        description="Expense Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Office Expense Report" />

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
                        Expense (Office) Report
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
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Reference No</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Expense Details</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Amount</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={5} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : expenseOfficeReports.expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    <TableRow className="text-sm">
                      <TableCell isHeader colSpan={4} className="border border-gray-500 text-center px-2 py-1">Opening Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                        {expenseOfficeReports.totalsByCurrency.map((expense) => (
                          <div key={`opening-${expense.currency}`} className="flex justify-between">
                            <div>{"(" + expense.currency + ")" }</div>
                            <div>{expense.previousTotal.toFixed(2)}</div>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                    {
                      expenseOfficeReports.expenses.map((expense, index) => (
                        <TableRow key={`${expense.paymentRefNo || expense.note || 'row'}-${index}`} className="border border-gray-500 dark:border-white/[0.05]">
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {expense?.paymentDate}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {expense.paymentRefNo}
                          </TableCell>
            
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {expense.note}
                          </TableCell>
                          <TableCell className="text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                            <div>{"(" + expense.currency + ")" }</div>
                            <div>{expense.amountPaid}</div> 
                          </TableCell>
                        </TableRow>
                      ))
                    }
                    <TableRow className="text-sm">
                      <TableCell isHeader colSpan={4} className="border border-gray-500 text-center px-2 py-1">Current Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                        {expenseOfficeReports.totalsByCurrency.map((expense) => (
                          <div key={`current-${expense.currency}`} className="flex justify-between">
                            <div>{"(" + expense.currency + ")" }</div>
                            <div>{expense.currentTotal.toFixed(2)}</div>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                    </>
                    
                  )}
                </TableBody>
                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader colSpan={4} className="border border-gray-500 text-center px-2 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                      {expenseOfficeReports.totalsByCurrency.map((expense) => (
                        <div key={`total-${expense.currency}`} className="flex justify-between">
                          <div>{"(" + expense.currency + ")" }</div>
                          <div>{(expense.previousTotal + expense.currentTotal).toFixed(2)}</div>
                        </div>
                      ))}
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
