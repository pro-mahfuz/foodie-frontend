import { useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectReceivablePayable, selectPartyStatus } from "../../party/features/partySelectors.ts";
import { fetchReceivablePayable } from "../../party/features/partyThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

export default function ReceivableReport() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    dispatch(fetchReceivablePayable());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const data = useSelector(selectReceivablePayable);
  console.log("data: ", data?.totals);
  const status = useSelector(selectPartyStatus);

  return (
    <>
      <PageMeta
        title="Receivable & Payable Report"
        description="Customers Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Receivable & Payable Report" />

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
                        Receivable & Payable Report
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">SL</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">PARTY NAME</TableCell>

                    {/* Show Receivable & Payable Columns */}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">RECEIVABLE</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">PAYABLE</TableCell>
                    </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {status === "loading" ? (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            Loading data...
                        </TableCell>
                        </TableRow>
                    ) : (
                      <>
                        {data?.parties
                          // keep only parties that have at least one non-zero balance
                          .filter(
                            (party) =>
                              party.summaryByCurrency.some(
                                (r) => Math.abs(Number(r.netBalance)) >= 0.005 // threshold for "non-zero"
                              )
                          )
                          .map((party, index) => (
                            <TableRow
                              key={index}
                              className="border-b border-gray-100 dark:border-white/[0.05]"
                            >
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </TableCell>

                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {party.name}
                              </TableCell>

                              {/* Receivable */}
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-red-500 dark:text-gray-400">
                                {party.summaryByCurrency
                                  .filter(
                                    (r) =>
                                      Number(r.netBalance) < 0 &&
                                      Math.abs(Number(r.netBalance)) >= 0.005
                                  )
                                  .map((r) => `${r.currency}: ${Number(r.netBalance).toFixed(2)}`)
                                  .join(", ") || "--"}
                              </TableCell>

                              {/* Payable */}
                              <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-green-700 dark:text-gray-400">
                                {party.summaryByCurrency
                                  .filter(
                                    (r) =>
                                      Number(r.netBalance) > 0 &&
                                      Math.abs(Number(r.netBalance)) >= 0.005
                                  )
                                  .map((r) => `${r.currency}: ${Number(r.netBalance).toFixed(2)}`)
                                  .join(", ") || "--"}
                              </TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                        <TableCell isHeader colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-300">
                            TOTAL SUMMARY
                        </TableCell>
                        </TableRow>
                        {data?.totals.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell isHeader colSpan={2} className="text-sm border border-gray-500 text-right px-2 py-1">{String(t.currency)}</TableCell>
                            <TableCell isHeader className="text-sm border border-gray-500 text-red-500 text-center px-2 py-1">{Number(t.receivable) === 0 ? "--" : Number(t.receivable).toFixed(2)}</TableCell>
                            <TableCell isHeader className="text-sm border border-gray-500 text-green-700 text-center px-2 py-1">{Number(t.payable) === 0 ? "--" : Number(t.payable).toFixed(2)}</TableCell>
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
