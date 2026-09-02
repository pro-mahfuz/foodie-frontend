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
import MonthPicker from "../../../components/form/month-picker.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectInvoiceStatus,
  selectSaleStatement
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectParties } from "../../party/features/partySelectors";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { selectStyles } from "../../types.ts";
import Select from "react-select";

export default function SaleStatement() {
  const { containerNo } = useParams()
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [partyId, setPartyId] = useState(0);

  useEffect(() => {
    dispatch(fetchParty({ type: "customer" }))
    dispatch(getSaleReport());
    dispatch(fetchAllCategory());
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
    () => selectSaleStatement(fromDate, toDate, partyId),
    [fromDate, toDate, partyId]
  );

  const saleReports = useSelector(saleReportSelector);

  return (
    <>
      <PageMeta
        title="Sale Report"
        description="Sale Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Sale Report" />

      <div className="flex justify-between print:hidden mb-2">
        <div className="flex">
          <div>
            <MonthPicker
              id="from-date"
              label=""
              placeholder="Month"
              onChange={(_, dateString) => {
                console.log({ dateString });
                setFromDate(dateString);
                setToDate(dateString);
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
              <div className="rounded-2xl lg:py-6">
                <div className="flex flex-row items-center text-center gap-5 xl:flex-row xl:justify-between">
                  <div className="flex flex-col items-center w-full gap-1">
                    {
                      user?.business?.businessLogo
                      ? <img
                          src={
                          user?.business?.businessLogo instanceof File
                              ? URL.createObjectURL(user.business.businessLogo)
                              : user?.business?.businessLogo
                              ? `${API_URL}${user?.business.businessLogo}`
                              : `${APP_URL}/public/images/logo/logo.svg`
                          }
                          alt="user"
                          className="w-[310px] h-[100px]"
                      />
                      : ''
                    }
                    
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
                    <h6 className="border border-gray-500 py-1 px-3 rounded-full text-sm font-semibold text-gray-800 dark:text-white/90 mt-5 bg-sky-200">
                        SALES STATEMENT {fromDate && toDate
                        ? `( ${new Date(fromDate + "-01")
                            .toLocaleString("default", { month: "long" })
                            .toUpperCase()} - ${new Date(fromDate + "-01")
                            .getFullYear()} )`
                        : ""} 
                    </h6>
                  </div>
                </div>
                <div className="flex flex-row items-start text-center gap-5 xl:flex-row xl:justify-between py-4">

                  <div className="flex flex-col items-start w-full gap-1">
                    <h6 className="text-sm font-semibold italic text-left text-gray-800 dark:text-white/90">
                        { partyId > 0 ? "To," : "" }
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        { partyId > 0 ? matchingParties.find(p => p.id === partyId)?.name : "" }
                    </h6>
                    {matchingParties.find(p => p.id === partyId)?.trnNo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            TRN No: {matchingParties.find(p => p.id === partyId)?.trnNo}
                        </p>
                    )}
                    {
                      matchingParties.find(p => p.id === partyId)?.address && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Address: {matchingParties.find(p => p.id === partyId)?.address}
                        </p>
                      )
                    }
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {matchingParties.find(p => p.id === partyId)?.email && `Email: ${matchingParties.find(p => p.id === partyId)?.email}, `}
                      {matchingParties.find(p => p.id === partyId)?.phoneNumber &&
                        `Phone: ${(matchingParties.find(p => p.id === partyId)?.phoneCode ?? "")}${matchingParties.find(p => p.id === partyId)?.phoneNumber}`}
                    </p>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Date</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Invoice No</TableCell>
                    {!partyId && (
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1 max-w-[150px] truncate">Customer</TableCell>
                    )}
                    
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Amount</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === "loading" ? (
                    <TableRow>
                      <TableCell
                        colSpan={5 - (!partyId ? 1 : 0)}
                        className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300"
                      >
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : saleReports.invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5 - (!partyId ? 1 : 0)}
                        className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300"
                      >
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      
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
                              {invoice?.invoiceNo}
                          </TableCell>
                          {!partyId && (
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                              {invoice?.party?.name}
                          </TableCell>
                          )}
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {Number(invoice.grandTotal ?? 0) - Number(invoice.paymentInSum ?? 0) ? (Number(invoice.grandTotal ?? 0) - Number(invoice.paymentInSum ?? 0)).toFixed(2) : "-" }
                          </TableCell>
                          
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>

                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader colSpan={4 - (partyId ? 1 : 0)} className="border border-gray-500 text-center px-2 py-1">Grand Total:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">
                        <div>{(saleReports.currentTotals.grandTotal).toFixed(2)}</div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {
              partyId > 0 ? (
                <div className="max-w-full mt-30 p-4 text-right">
                  <p>---------------------</p>
                  <p>Authorized Signature</p>
                </div>
              ) : null
            }
            
          </div>
        </div>

      </div>
    </>
  );
}
