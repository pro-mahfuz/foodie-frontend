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

import Select from "react-select";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectStyles } from "../../types.ts";
import {
  selectPaymentStatus,
  selectAllContainerExpense
} from "../../payment/features/paymentSelectors.ts";
import { fetchAll } from "../../payment/features/paymentThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { fetchAll as fetchContainer } from "../../container/features/containerThunks.ts";
import { selectAllContainer } from "../../container/features/containerSelectors";

export default function ExpenseContainerReport() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [containerId, setContainerId] = useState(0);

  useEffect(() => {
    dispatch(fetchAll());
     dispatch(fetchContainer());
  }, [dispatch]);

  const status = useSelector(selectPaymentStatus);
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const containers = useSelector(selectAllContainer);
  const expenseContainerReports = useSelector(selectAllContainerExpense(containerId));

  const totalExpense = useMemo(() => {
    return expenseContainerReports.reduce(
      (acc, payment) => {
        acc.totalExpense += Number(payment.amountPaid);

        return acc;
      },
      { totalExpense: 0 } // initial accumulator
    );
  }, [expenseContainerReports]);

  return (
    <>
      <PageMeta
        title="Container Expense Report"
        description="Expense Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Container Expense Report" />

      <div className="flex justify-between print:hidden mb-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-2">
          <div>
            {/* <Label>Search Container</Label> */}
            <Select
              options={containers.map((i) => ({
                label: i.containerNo,
                value: i.id,
              }))}
              placeholder="Select Container"
              onChange={(selectedOption) =>
                setContainerId(selectedOption?.value ?? 0)
              }
              isClearable
              styles={selectStyles}
              classNamePrefix="react-select"
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
                        Expense (Container) Report
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="text-center px-2 py-1">Sl</TableCell>
                    <TableCell isHeader className="text-center px-2 py-1">Date</TableCell>
                    <TableCell isHeader className="text-center px-2 py-1">Reference No</TableCell>
                    <TableCell isHeader className="text-center px-2 py-1">Container No</TableCell>
                    <TableCell isHeader className="text-center px-2 py-1">Expense Details</TableCell>
                    <TableCell isHeader className="text-center px-2 py-1">Amount</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={6} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : expenseContainerReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseContainerReports.map((expense, index) => (
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
                            {expense.container?.containerNo}
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
                  )}
                </TableBody>

                <TableFooter className="border border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader colSpan={5} className="border border-gray-500 text-center px-2 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{ totalExpense.totalExpense.toFixed(2)}</TableCell>
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
