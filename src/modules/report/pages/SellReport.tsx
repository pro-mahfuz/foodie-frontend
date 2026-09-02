import { useMemo, useEffect, useState } from "react";
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
  selectSaleReport_system_2
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { selectParties } from "../../party/features/partySelectors";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { selectStyles } from "../../types.ts";
import Select from "react-select";

export default function SellReport() {
  const { containerNo } = useParams()
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [container, setContainer] = useState('');
  const [partyId, setPartyId] = useState(0);

  useEffect(() => {
    dispatch(fetchParty({ type: "customer" }))
    dispatch(getSaleReport());
    dispatch(fetchAllCategory());
    dispatch(fetchAll());
    setContainer(containerNo ?? '');
  }, [dispatch, containerNo]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);


  const isCurrencyOrGold = categories.some((c) =>
    ["currency", "gold"].includes(c.name.toLowerCase())
  );

  const partyType = isCurrencyOrGold ? "all": "customer" ;

  const matchingParties = useSelector(
    selectParties(Number(user?.business?.id), partyType)
  );

  const saleReportSelector = useMemo(
    () => selectSaleReport_system_2(fromDate, toDate, container, partyId),
    [fromDate, toDate, container, partyId]
  );

  const saleReports = useSelector(saleReportSelector);

  return (
    <>
      <PageMeta
        title="Sell Report"
        description="Sell Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Sell Report" />

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

          <div className="ml-2 min-w-80">
            <Select
              options={matchingParties.map((p) => ({
                  label: p.name,
                  value: p.id,
              }))}
              placeholder="Select Supplier/Customer"
              value={
                  matchingParties
                      .filter((p) => p.id === partyId)
                      .map((p) => ({ label: p.name, value: p.id }))[0] || null
              }
              onChange={(selectedOption) =>
                  setPartyId(selectedOption?.value ?? 0)
              }
              isClearable
              styles={selectStyles}
              classNamePrefix="react-select"
              required
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
                        Sell Report
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        { fromDate && toDate && !container ? "Date: " + fromDate + " to " + toDate : "" }
                        { !fromDate && toDate && !container ? "Date: " + toDate : "" }
                        { fromDate && !toDate ? "Date: " + fromDate : "" }
                        { !fromDate && !toDate && container ? "Container No: " + container : "" }
                        { !fromDate && !toDate && !container && partyId > 0 ? "Customer Name: " + matchingParties.find(p => p.id === partyId)?.name : "" }
                    </h6>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Date</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Invoice No</TableCell>
                    {!partyId && (
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1 max-w-[150px] truncate">Customer</TableCell>
                    )}
                    { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                      <TableCell
                        isHeader
                        className="border border-gray-500 text-center px-2 py-1 max-w-[150px] truncate"
                      >
                        Container
                      </TableCell>
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Qty</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Price</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Net Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Vat Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Grand Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Paid Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Due Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Remarks</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === "loading" ? (
                    <TableRow>
                      <TableCell
                        colSpan={15 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0) - (partyId ? 1 : 0)}
                        className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300"
                      >
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : saleReports.invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={15 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0) - (partyId ? 1 : 0)}
                        className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300"
                      >
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {/* Previous Totals Row */}
                      <TableRow className="text-sm">
                        <TableCell
                          isHeader
                          colSpan={9 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0) - (partyId ? 1 : 0)}
                          className="border border-gray-500 text-center px-2 py-1"
                        >
                          Opening Summary:
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.previousTotals.netTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.previousTotals.vatTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.previousTotals.grandTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.previousTotals.paidTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.previousTotals.dueTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {" "}
                        </TableCell>
                      </TableRow>

                      {/* Now render invoices */}
                      {saleReports.invoices.map((invoice, index) => (
                        <TableRow key={index}>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {invoice?.date}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {invoice?.vatInvoiceRefNo}
                          </TableCell>
                          {!partyId && (
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                              {invoice?.party?.name}
                          </TableCell>
                          )}
                          { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {invoice.items.map((item, index) => (
                                <div key={index}>
                                  {item.container?.containerNo}
                                  {index < invoice.items.length - 1 && <br />}
                                </div>
                              ))}
                            </TableCell>
                          )}
            
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.items.map((item, index) => (
                              <div key={index}>
                                {item.name}
                                {index < invoice.items.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.items.map((item, index) => (
                              <div key={index}>
                                {item.unit}
                                {index < invoice.items.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.items.map((item, index) => (
                              <div key={index}>
                                {item.quantity}
                                {index < invoice.items.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.items.map((item, index) => (
                              <div key={index}>
                                {item.price}
                                {index < invoice.items.length - 1 && <br />}
                              </div>
                            ))}
                          </TableCell>
                          
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice?.isVat === true ? ((invoice.totalAmount) * Number(invoice?.vatPercentage) / 100).toFixed(2) : "-"}
                          </TableCell>


                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {invoice?.isVat === true
                              ? ((invoice.totalAmount) * (1 + (Number(invoice?.vatPercentage) / 100))).toFixed(2)
                              : (invoice.totalAmount)}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {Number(invoice.paymentInSum) > 0 ? Number(invoice.paymentInSum).toFixed(2) : "-"}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {Number(invoice.grandTotal ?? 0) - Number(invoice.paymentInSum ?? 0) ? (Number(invoice.grandTotal ?? 0) - Number(invoice.paymentInSum ?? 0)).toFixed(2) : "-" }
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {invoice.note}
                          </TableCell>

                        </TableRow>
                      ))}

                      {/* Current Totals Row */}
                      <TableRow className="text-sm">
                        <TableCell
                          isHeader
                          colSpan={9 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0) - (partyId ? 1 : 0)}
                          className="border border-gray-500 text-center px-2 py-1"
                        >
                          Current Summary:
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.currentTotals.netTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.currentTotals.vatTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.currentTotals.grandTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.currentTotals.paidTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {saleReports.currentTotals.dueTotal.toFixed(2)}
                        </TableCell>
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                          {" "}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>

                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell 
                      isHeader 
                      colSpan={9 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0) - (partyId ? 1 : 0)}
                      className="border border-gray-500 text-center px-2 py-1">
                      Total Summany:
                    </TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{(saleReports.previousTotals.netTotal + saleReports.currentTotals.netTotal).toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{(saleReports.previousTotals.vatTotal + saleReports.currentTotals.vatTotal).toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{(saleReports.previousTotals.grandTotal + saleReports.currentTotals.grandTotal).toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{(saleReports.previousTotals.paidTotal + saleReports.currentTotals.paidTotal).toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{(saleReports.previousTotals.dueTotal + saleReports.currentTotals.dueTotal).toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
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
