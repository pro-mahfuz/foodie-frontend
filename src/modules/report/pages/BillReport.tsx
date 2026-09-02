import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  selectInvoiceStatus,
  selectBillReport
} from "../../invoice/features/invoiceSelectors.ts";
import { getBillReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { selectStyles } from "../../types.ts";
import Select from "react-select";

export default function BillReport() {
  const { containerNo } = useParams()
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [container, setContainer] = useState('');

  useEffect(() => {
    dispatch(getBillReport());
    dispatch(fetchAllCategory());
    dispatch(fetchAll());
    setContainer(containerNo ?? '');
  }, [dispatch, containerNo]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);
  const containers = useSelector(selectAllContainer);
  const billReports = useSelector(selectBillReport(fromDate, toDate, container));

  return (
    <>
      <PageMeta
        title="Bill Report"
        description="Bill Report"
      />
      <PageBreadcrumb pageTitle="Bill Report" />

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
          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
            <div className="ml-2">
              <Select
                options={
                containers
                    ?.map((i) => ({
                        label: `${i.containerNo}`,
                        value: i.id,
                        containerNo: i.containerNo,
                    })) || []
                }
                placeholder="Select container"
            
                onChange={(selectedOption) =>
                    setContainer(selectedOption?.containerNo ?? '')
                }
                isClearable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>
          )}
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
            <div className="max-w-full">
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
                        Bill Report
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        { fromDate && toDate && !container ? "Date: " + fromDate + " to " + toDate : "" }
                        { !fromDate && toDate && !container ? "Date: " + toDate : "" }
                        { fromDate && !toDate ? "Date: " + fromDate : "" }
                        { !fromDate && !toDate && container ? "Container No: " + container : "" }
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Container</TableCell>
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Provider</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Item/Description</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Net Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Vat Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Grand Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Paid Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Due Total</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : billReports.invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    <TableRow className="text-sm">
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                        <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                      )}
                      <TableCell isHeader colSpan={3} className="border border-gray-500 border border-gray-500 text-center px-4 py-1">Opening Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.previous.netTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.previous.vatTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.previous.grandTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.previous.paidTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.previous.dueTotal.toFixed(2)}</TableCell>
                    </TableRow>
                    {
                      billReports.invoices.map((invoice, index) => {
                        const total = Number(invoice.totalAmount) || 0;
                        const vatPct = Number(invoice?.vatPercentage) || 0;
                        const vatAmount = invoice?.isVat ? (total * vatPct) / 100 : 0;
                        const grandTotal = total + vatAmount;

                        return (
                          <TableRow>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {invoice.date}
                            </TableCell>
                            {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                              <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                  {invoice.items.map((item, idx) => (
                                    <span key={`${item.id || idx}`}>
                                      {item.container?.containerNo}
                                      <br />
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {invoice?.party?.name}
                            </TableCell>
              
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                {invoice.items.map((item, idx) => (
                                  <span key={`${item.id || idx}`}>
                                    {item.name}
                                    <br />
                                  </span>
                                ))}
                              </div>
                              <div>
                                {invoice.note}
                              </div>
                            </TableCell>
                            
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {(invoice.totalAmount).toFixed(2)}
                            </TableCell>
                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {invoice?.isVat === true ? (Number(invoice.totalAmount) * Number(invoice?.vatPercentage) / 100) : "-"}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {grandTotal}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {Number(invoice.totalPaid)}
                            </TableCell>

                            <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {(grandTotal - Number(invoice.totalPaid)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    }
                    <TableRow className="text-sm">
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                        <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                      )}
                      <TableCell isHeader colSpan={3} className="border border-gray-500 text-center px-4 py-1">Current Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.current.netTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.current.vatTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.current.grandTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.current.paidTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.current.dueTotal.toFixed(2)}</TableCell>
                    </TableRow>
                    </>
                    
                  )}
                </TableBody>
                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                    )}
                    <TableCell isHeader colSpan={3} className="border border-gray-500 text-center px-4 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{""}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.overall.netTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.overall.vatTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.overall.grandTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.overall.paidTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">{billReports.overall.dueTotal.toFixed(2)}</TableCell>
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
