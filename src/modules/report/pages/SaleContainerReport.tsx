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
  selectSaleContainerReport
} from "../../invoice/features/invoiceSelectors.ts";
import { getSaleContainerReport } from "../../invoice/features/invoiceThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import AsyncSelect from "react-select/async";
import * as containerAPI from "../../container/features/containerAPI.ts";
import { selectStyles } from "../../types.ts";

type ContainerOption = { label: string; value: number };

export default function SaleContainerReport() {
  const { containerNo } = useParams()
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [container, setContainer] = useState('');

  useEffect(() => {
    dispatch(getSaleContainerReport());
    dispatch(fetchAllCategory());
    setContainer(containerNo ?? '');
  }, [dispatch, containerNo]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);
  const loadContainerOptions = async (inputValue: string) => {
    const data = await containerAPI.fetchOptions({
      page: 1,
      limit: 20,
      filterText: inputValue.trim(),
    });
    return data.containers.map((item: { id?: number; containerNo: string }): ContainerOption => ({
      label: item.containerNo,
      value: Number(item.id),
    }));
  };

  const saleReportContainerSelector = useMemo(
    () => selectSaleContainerReport(fromDate, toDate, container),
    [fromDate, toDate, container]
  );

  const saleContainerReports = useSelector(saleReportContainerSelector);
  console.log("saleReportContainerSelector: ", saleContainerReports);


  return (
    <>
      <PageMeta
        title="Sale (Container) Report"
        description="Sale Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Sale (Container) Report" />

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
          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
          <div className="ml-2">
            <AsyncSelect<ContainerOption>
              cacheOptions
              defaultOptions
              loadOptions={loadContainerOptions}
              placeholder="Select container"
              onChange={(selectedOption) =>
                  setContainer(selectedOption?.label ?? '')
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
                        Sales (Container) Report
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        { fromDate && toDate && !container ? "Date: " + fromDate + " to " + toDate : "" }
                        { !fromDate && toDate && !container ? "Date: " + toDate : "" }
                        { fromDate && !toDate ? "Date: " + fromDate : "" }
                        { fromDate && toDate && container ? "Date: " + fromDate + " to " + toDate : "" }
                    </h6>
                    <h6 className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-5">
                        { fromDate && toDate && container ? "Container No: " + container : "" }
                        { !fromDate && !toDate && container ? "Container No: " + container : "" }
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
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Vat Invoice No</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      !container ?
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Container</TableCell>
                      : ""
                    )}
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Item</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Unit</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Qty</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Price</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Net Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Vat Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Grand Total</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">Remarks</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={13} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : saleContainerReports.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                    <TableRow className="text-sm">
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                        !container ?
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                        : ''
                      )}
                      <TableCell isHeader colSpan={5} className="border border-gray-500 text-center px-2 py-1">Opening Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.previous.qtyTotal}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.previous.netTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.previous.vatTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.previous.grandTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                    </TableRow>
                    {
                      saleContainerReports.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.invoice?.date}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.invoiceNo}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.vatInvoiceRefNo}
                          </TableCell>
                          {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                            !container ?
                            <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.container?.containerNo}
                            </TableCell>
                            : ''
                          )}
            
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.name}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.unit}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.quantity}
                          </TableCell>
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.price}
                          </TableCell>
                          
                          
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.subTotal}
                          </TableCell>

                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(item.itemVat) > 0 ? (Number(item.itemVat)).toFixed(2) : "-"}
                              {/* {Number(item.itemVat) > 0 ? ((Number(item.subTotal) * Number(item.itemVat)) / 100).toFixed(2) : "-"} */}
                          </TableCell>


                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                            {Number(item.itemVat) > 0 
                              ? (Number(item.subTotal) + Number(item.itemVat)).toFixed(2)
                              : Number(item.subTotal)}
                          </TableCell>
                          <TableCell className="border border-gray-500 text-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                              {item.invoice?.note}
                          </TableCell>

                        </TableRow>
                      ))
                    }
                    <TableRow className="text-sm">
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                        !container ?
                        <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                        : ''
                      )}
                      <TableCell isHeader colSpan={5} className="border border-gray-500 text-center px-2 py-1">Current Summany:</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.current.qtyTotal}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.current.netTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.current.vatTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.current.grandTotal.toFixed(2)}</TableCell>
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                    </TableRow>
                    </>
                    
                  )}
                </TableBody>
                <TableFooter className="border border-gray-500 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                  <TableRow>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                    {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                      !container ?
                      <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                      : ''
                    )}
                    <TableCell isHeader colSpan={5} className="border border-gray-500 text-center px-2 py-1">Total Summany:</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.overall.qtyTotal}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{""}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.overall.netTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.overall.vatTotal.toFixed(2)}</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-2 py-1">{saleContainerReports.overall.grandTotal.toFixed(2)}</TableCell>
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
