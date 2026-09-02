import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EyeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { toast } from "react-toastify";

import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { Invoice } from "../features/invoiceTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import {
  selectAllInvoicePagination,
  selectInvoiceStatus,
  selectTotalPages,
  selectTotalItems,
} from "../features/invoiceSelectors.ts";
import { fetchAllInvoicePagination, destroy } from "../features/invoiceThunks.ts";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function InvoiceList() {
  const { invoiceType } = useParams() as { invoiceType: 'purchase' | 'sale' | 'all' };
  const isAllInvoices = invoiceType === "all";
  const isSaleInvoices = invoiceType === "sale";
  const listTitle = isAllInvoices ? "All invoices" : isSaleInvoices ? "Sale invoices" : "Purchase invoices";
  const partyLabel = isAllInvoices ? "Party" : isSaleInvoices ? "Customer" : "Supplier";
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser?.user?.id)));

  const invoices = useSelector(selectAllInvoicePagination);
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);

  const totalPages = useSelector(selectTotalPages);
  const totalItems = useSelector(selectTotalItems);
  const paginationStorageKey = `invoice-list-pagination:${invoiceType ?? 'all'}`;
  const [invoiceSearchInput, setInvoiceSearchInput] = useState('');
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(() => Number(window.localStorage.getItem(`${paginationStorageKey}:page`)) || 1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const savedLimit = Number(window.localStorage.getItem(`${paginationStorageKey}:limit`));
    return [10, 25, 50, 100, 250, 500].includes(savedLimit) ? savedLimit : 10;
  });
  const [pageInput, setPageInput] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);
  useEffect(() => {
    window.localStorage.setItem(`${paginationStorageKey}:page`, String(currentPage));
    window.localStorage.setItem(`${paginationStorageKey}:limit`, String(itemsPerPage));
  }, [currentPage, itemsPerPage, paginationStorageKey]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInvoiceSearch(invoiceSearchInput.trim());
      setCustomerSearch(customerSearchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [invoiceSearchInput, customerSearchInput]);

  // Fetch data whenever the server-side filters or pagination change
  useEffect(() => {
    if (!categories.length) dispatch(fetchAllCategory());
    dispatch(fetchAllInvoicePagination({ page: currentPage, limit: itemsPerPage, type: invoiceType, filterText: invoiceSearch, partyName: customerSearch, date: dateFilter, invoiceType: invoiceTypeFilter }));
  }, [dispatch, currentPage, itemsPerPage, invoiceType, invoiceSearch, customerSearch, dateFilter, invoiceTypeFilter, refreshKey, categories.length]);

  const handleView = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.id}/view`);
  };

  const handleEdit = (invoice: Invoice) => {
    invoice.invoiceType === "clearance_bill"
      ? navigate(`/bill/${invoice.id}/edit`)
      : navigate(`/invoice/${invoice.id}/edit`);
  };

  const handleListRefresh = () => {
    setInvoiceSearchInput('');
    setCustomerSearchInput('');
    setInvoiceSearch('');
    setCustomerSearch('');
    setDateFilter('');
    setInvoiceTypeFilter('');
    setItemsPerPage(10);
    setCurrentPage(1);
    setRefreshKey((key) => key + 1);
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await dispatch(destroy(selectedInvoice.id!)).unwrap();
      toast.success("Invoice deleted successfully");
      setRefreshKey((key) => key + 1);
    } catch (error: any) {
      toast.error(error);
    }
    closeAndResetModal();
  };

  const closeAndResetModal = () => {
    setSelectedInvoice(null);
    closeModal();
  };

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (totalPages && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const applyPage = () => {
    const page = Math.min(Math.max(Number(pageInput) || 1, 1), Math.max(totalPages, 1));
    setCurrentPage(page);
    setPageInput(String(page));
  };
  const hasFilters = Boolean(invoiceSearchInput || customerSearchInput || dateFilter || invoiceTypeFilter);

  return (
    <>
      <PageMeta
        title={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`}
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`} />

      {/* <div className="flex items-center space-x-4 mb-4">
        <Input
          type="number"
          name="invoiceId"
          value={filterText}
          onChange={(e) => setFilterText(Number(e.target.value))}
          placeholder="Invoice ID"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => handleGoEdit(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View
        </button>
      </div> */}

      {/* <div className="flex items-center space-x-4 mb-4">

        <div>
          <DatePicker
            id="from-date"
            label=""
            placeholder="Date"
            onChange={(dates, currentDateString) => {
                console.log({ dates, currentDateString });
                setFromDate(currentDateString);
            }}
          />
        </div>
        
        <Input
          type="number"
          name="filterText"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Invoice ID"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>

        <button
          onClick={() => handleGoView(filterText)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Reset
        </button>
      </div> */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">{isAllInvoices ? "Invoices" : isSaleInvoices ? "Sales" : "Purchases"}</p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{listTitle}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{totalItems.toLocaleString()} invoices found</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
              <button onClick={handleListRefresh} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button>
              <button onClick={() => navigate(`/invoice/${invoiceType}/create`)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PlusIcon className="h-4 w-4" /> Add {isAllInvoices ? "invoice" : invoiceType}</button>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Invoice and {partyLabel.toLowerCase()} searches are applied on the server.</p></div>{hasFilters && <button onClick={() => { setInvoiceSearchInput(''); setCustomerSearchInput(''); setDateFilter(''); setInvoiceTypeFilter(''); setCurrentPage(1); }} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filters</button>}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Invoice reference<input aria-label="Search invoice reference" value={invoiceSearchInput} onChange={(event) => setInvoiceSearchInput(event.target.value)} placeholder="Invoice number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{partyLabel}<input aria-label={`Search ${partyLabel.toLowerCase()}`} value={customerSearchInput} onChange={(event) => setCustomerSearchInput(event.target.value)} placeholder={`${partyLabel} name`} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date<input aria-label={`Filter ${invoiceType} invoices by date`} type="date" value={dateFilter} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1); }} className="mt-1 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
              {isAllInvoices && <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Invoice type<select aria-label="Filter by invoice type" value={invoiceTypeFilter} onChange={(event) => { setInvoiceTypeFilter(event.target.value); setCurrentPage(1); }} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200"><option value="">All invoices</option><option value="purchase">Purchase</option><option value="sale">Sale</option></select></label>}
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
            <Table className="min-w-[1800px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Invoice / Date</TableCell>
                  <TableCell isHeader className="w-48 border border-gray-200 px-3 py-3 text-center">Party Name</TableCell>
                  {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                    <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Container</TableCell>
                  )}
                  
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Items</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Unit</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Qty</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Price</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Sub Total</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Vat Total</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Grand Total</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Discount</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Net Total</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Payment</TableCell>
                  <TableCell isHeader className="border border-gray-200 px-3 py-3 text-center">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={13 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 2: 0)} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 2: 0)} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice, index) => (
                    <TableRow key={invoice.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/80 dark:border-white/[0.06] dark:hover:bg-white/[0.03]">
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                      <TableCell className="border border-gray-500 px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">{invoice.vatInvoiceRefNo && <div className="mb-0.5 font-semibold text-emerald-600 dark:text-emerald-400">{invoice.vatInvoiceRefNo}</div>}<div className="font-medium text-gray-700 dark:text-gray-200">{invoice.invoiceNo}</div><div className="mt-0.5 text-xs text-gray-400">{invoice.date}</div></TableCell>
                      <TableCell className="w-48 max-w-48 whitespace-normal break-words border border-gray-500 px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        {invoice.party?.name && invoice.partyId ? (
                          <button
                            type="button"
                            onClick={() => window.open(`/invoice/${invoice.id}/view`, '_blank', 'noopener,noreferrer')}
                            className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                          >
                            {invoice.party.name}
                          </button>
                        ) : '-'}
                      </TableCell>
                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                        <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {invoice.items.map((item, idx) => (
                            <div key={idx}>{item.container?.containerNo}</div>
                          ))}
                        </TableCell>
                      )}
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.name}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.unit}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.quantity}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.items.map((item, idx) => (
                          <div key={idx}>{item.price}</div>
                        ))}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.vatAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.grandTotal?.toFixed(2)}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {Number(invoice.discount) > 0 ? invoice.discount?.toFixed(2) : '-'}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {(Number(invoice.grandTotal) - Number(invoice.discount)).toFixed(2)}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 px-1 py-1 text-center text-sm dark:text-gray-400">
                        {(() => {
                          const paid = Number(invoice.invoiceType === "sale" ? invoice.paymentInSum : invoice.paymentOutSum) || 0;
                          const due = Math.max((Number(invoice.grandTotal) || 0) - (Number(invoice.discount) || 0) - paid, 0);

                          return (
                            <>
                              {paid > 0 && <div className="text-emerald-700">Paid: {paid.toFixed(2)}</div>}
                              {due > 0 && <div className={paid > 0 ? "mt-0.5 text-rose-500" : "text-rose-500"}>Due: {due.toFixed(2)}</div>}
                              {paid === 0 && due === 0 && <span>-</span>}
                            </>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems anchor="bottom end" portal className="z-[100] w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              { user?.role?.permissions?.some(p => ["view_invoice","view_purchase","view_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => handleView(invoice)} className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <EyeIcon className="h-4 w-4" /> View
                                  </button>
                                )}</MenuItem>
                              )}
                              { user?.role?.permissions?.some(p => ["edit_invoice","edit_purchase","edit_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => handleEdit(invoice)} className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <PencilIcon className="h-4 w-4" /> Edit
                                  </button>
                                )}</MenuItem>
                              )}
                              { user?.role?.permissions?.some(p => ["delete_invoice","delete_purchase","delete_sale"].includes(p.action)) && (
                                <MenuItem>{({ active }) => (
                                  <button onClick={() => { setSelectedInvoice(invoice); openModal(); }} className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 px-1 py-2 text-sm`}>
                                    <TrashIcon className="h-4 w-4" /> Delete
                                  </button>
                                )}</MenuItem>
                              )}
                            </div>
                          </MenuItems>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {Math.max(totalPages, 1)}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
          </div>
      </section>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this invoice?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
