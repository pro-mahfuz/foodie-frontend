import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusIcon,
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
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

import { toast } from "react-toastify";
import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { Payment, paymentOptions } from "../features/paymentTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectPaymentStatus, selectAllPaymentPaginated, selectTotalPages } from "../features/paymentSelectors.ts";
import { fetchAllPaginated, destroy } from "../features/paymentThunks.ts";
import * as partyAPI from "../../party/features/partyAPI.ts";
import * as paymentAPI from "../features/paymentAPI.ts";

type FilterOption = { label: string; value: string };
const filterSelectStyles = {
  control: (base: any) => ({ ...base, minHeight: '36px', fontSize: '13px', borderColor: '#e5e7eb', boxShadow: 'none' }),
  valueContainer: (base: any) => ({ ...base, padding: '0 9px' }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0, fontSize: '13px' }),
  option: (base: any, state: any) => ({ ...base, fontSize: '13px', lineHeight: 1.35, padding: '8px 10px', backgroundColor: state.isSelected ? '#465fff' : state.isFocused ? '#eef2ff' : 'white' }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};
const SearchableFilter = ({ label, value, options, onChange }: { label: string; value: string; options: FilterOption[]; onChange: (value: string) => void }) => (
  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}<Select value={options.find((option) => option.value === value) ?? null} options={options} onChange={(option) => onChange(option?.value ?? '')} isClearable isSearchable placeholder={`All ${label.toLowerCase()}s`} menuPortalTarget={document.body} menuPosition="fixed" styles={filterSelectStyles} className="mt-1 text-sm" classNamePrefix="react-select" /></label>
);

export default function PaymentList() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const payments = useSelector(selectAllPaymentPaginated);
  const status = useSelector(selectPaymentStatus);
  const totalPages = useSelector(selectTotalPages);

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [pageInput, setPageInput] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');
  const [partyFilter, setPartyFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [referenceFilter, setReferenceFilter] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('');

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    dispatch(fetchAllPaginated({
      page: currentPage,
      limit: itemsPerPage,
      system: 1,
      filterText,
      paymentDate: dateFilter,
      partyId: partyFilter,
      invoiceRef: invoiceFilter,
      paymentRef: referenceFilter,
    }));
  }, [dispatch, filterText, itemsPerPage, currentPage, refreshKey, dateFilter, partyFilter, invoiceFilter, referenceFilter]);

  const handleEdit = (payment: Payment) => {
    navigate(`/payment/${payment.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      dispatch(destroy(selectedPayment.id!)).unwrap();
      toast.success("Payment deleted successfully");
      //navigate(`/payment/list`);
    } catch (error) {
      toast.error("Failed to delete payment");
    }
    closeAndResetModal();
    dispatch(fetchAllPaginated({ page: currentPage, limit: itemsPerPage, system: 1, filterText, paymentDate: dateFilter, partyId: partyFilter, invoiceRef: invoiceFilter, paymentRef: referenceFilter }));
  };

  const handleView = (payment: Payment) => {
    navigate(`/payment/${payment.id}/view`);
  };

  const closeAndResetModal = () => {
    setSelectedPayment(null);
    closeModal();
  };

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (totalPages && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  const clearPaymentFilters = () => {
    setFilterText('');
    setDateFilter(''); setPaymentTypeFilter(''); setPartyFilter(''); setCurrencyFilter(''); setReferenceFilter(''); setInvoiceFilter('');
    setCurrentPage(1);
  };
  const hasPaymentFilters = Boolean(filterText || dateFilter || paymentTypeFilter || partyFilter || currencyFilter || referenceFilter || invoiceFilter);

  const handleListRefresh = () => {
    clearPaymentFilters();
    dispatch(fetchAllPaginated({ page: 1, limit: itemsPerPage, system: 1, filterText: '' }));
    setRefreshKey((key) => key + 1);
  };
  const filteredPayments = useMemo(() => payments.filter((payment) =>
    (!dateFilter || String(payment.paymentDate ?? '').slice(0, 10) === dateFilter) &&
    (!paymentTypeFilter || payment.paymentType === paymentTypeFilter) &&
    (!partyFilter || String(payment.partyId) === partyFilter) &&
    (!currencyFilter || payment.currency === currencyFilter) &&
    (!referenceFilter || payment.paymentRefNo === referenceFilter) &&
    (!invoiceFilter || payment.invoiceRefNo === invoiceFilter)
  ), [payments, dateFilter, paymentTypeFilter, partyFilter, currencyFilter, referenceFilter, invoiceFilter]);
  const dropdownOptions = useMemo(() => ({
    references: payments.map((payment) => ({ label: payment.paymentRefNo ?? '', value: payment.paymentRefNo ?? '' })).filter((option) => option.value),
    invoices: Array.from(new Set(payments.map((payment) => payment.invoiceRefNo).filter(Boolean))).map((value) => ({ label: value!, value: value! })),
    types: paymentOptions.map((option) => ({ label: option.label, value: option.value })),
    parties: Array.from(new Map(payments.filter((payment) => payment.partyId).map((payment) => [String(payment.partyId), payment.party?.name ?? `Party #${payment.partyId}`]))).map(([value, label]) => ({ value, label })),
    currencies: Array.from(new Set(payments.map((payment) => payment.currency))).map((value) => ({ label: value, value })),
  }), [payments]);
  const loadPartyOptions = async (inputValue: string) => {
    const data = await partyAPI.fetchPartyPaginated({ page: 1, limit: 10, type: 'all', filterText: inputValue });
    return data.parties.map((party) => ({ label: party.name, value: String(party.id) }));
  };
  const loadReferenceOptions = async (inputValue: string) => {
    const data = await paymentAPI.fetchAllPaginated({ page: 1, limit: 10, system: 1, filterText: /^(.*)-\d+$/.test(inputValue) ? '' : inputValue, paymentRef: inputValue });
    return Array.from(new Map(data.payments.filter((payment) => payment.paymentRefNo).map((payment) => [payment.paymentRefNo!, { label: payment.paymentRefNo!, value: payment.paymentRefNo! }])).values());
  };
  const loadInvoiceOptions = async (inputValue: string) => {
    const data = await paymentAPI.fetchAllPaginated({ page: 1, limit: 10, system: 1, filterText: /^(.*)-\d+$/.test(inputValue) ? '' : inputValue, invoiceRef: inputValue });
    return Array.from(new Map(data.payments.filter((payment) => payment.invoiceRefNo).map((payment) => [payment.invoiceRefNo!, { label: payment.invoiceRefNo!, value: payment.invoiceRefNo! }])).values());
  };

  return (
    <>
      <PageMeta
        title="Payment List"
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Payment List" />

      <div className="space-y-6">
        <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Payments</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage payment records, references, and settlements.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button onClick={handleListRefresh} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button><button onClick={() => navigate('/payment/create')} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PlusIcon className="h-4 w-4" /> Add payment</button></div></div>
          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6"><div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Refine payments by reference, invoice, date, type, party, or currency.</p></div>{hasPaymentFilters && <button type="button" onClick={clearPaymentFilters} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filters</button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"><label className="text-xs font-medium text-gray-600 dark:text-gray-300">Reference<AsyncSelect cacheOptions defaultOptions={dropdownOptions.references} loadOptions={loadReferenceOptions} value={referenceFilter ? { value: referenceFilter, label: referenceFilter } : null} onChange={(option) => { setReferenceFilter(option?.value ?? ''); setCurrentPage(1); }} isClearable isSearchable placeholder="Search reference" menuPortalTarget={document.body} menuPosition="fixed" styles={filterSelectStyles} className="mt-1 text-sm" classNamePrefix="react-select" /></label><label className="text-xs font-medium text-gray-600 dark:text-gray-300">Invoice<AsyncSelect cacheOptions defaultOptions={dropdownOptions.invoices} loadOptions={loadInvoiceOptions} value={invoiceFilter ? { value: invoiceFilter, label: invoiceFilter } : null} onChange={(option) => { setInvoiceFilter(option?.value ?? ''); setCurrentPage(1); }} isClearable isSearchable placeholder="Search invoice" menuPortalTarget={document.body} menuPosition="fixed" styles={filterSelectStyles} className="mt-1 text-sm" classNamePrefix="react-select" /></label><label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date<input type="date" value={dateFilter} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1); }} className="mt-1 h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm dark:border-white/[0.12] dark:bg-gray-900" /></label><SearchableFilter label="Payment type" value={paymentTypeFilter} onChange={setPaymentTypeFilter} options={dropdownOptions.types} /><label className="text-xs font-medium text-gray-600 dark:text-gray-300">Party<AsyncSelect cacheOptions defaultOptions={dropdownOptions.parties} loadOptions={loadPartyOptions} value={partyFilter ? { value: partyFilter, label: dropdownOptions.parties.find((option) => option.value === partyFilter)?.label ?? `Party #${partyFilter}` } : null} onChange={(option) => { const value = option?.value ?? ''; setPartyFilter(value); setCurrentPage(1); }} isClearable isSearchable placeholder="Search party" menuPortalTarget={document.body} menuPosition="fixed" styles={filterSelectStyles} className="mt-1 text-sm" classNamePrefix="react-select" /></label><SearchableFilter label="Currency" value={currencyFilter} onChange={setCurrencyFilter} options={dropdownOptions.currencies} /></div></div>

          <div className="overflow-x-auto px-5 py-4">
            <Table className="min-w-[1200px] border border-gray-200 [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-sm text-gray-700 dark:bg-white/[0.04] dark:text-gray-300">
                <TableRow>
                  <TableCell isHeader className="px-3 py-3 text-center">#</TableCell><TableCell isHeader className="px-3 py-3">Date</TableCell><TableCell isHeader className="px-3 py-3">Reference</TableCell><TableCell isHeader className="px-3 py-3">Type</TableCell><TableCell isHeader className="px-3 py-3">Invoice</TableCell><TableCell isHeader className="px-3 py-3">Party</TableCell><TableCell isHeader className="px-3 py-3">Currency</TableCell><TableCell isHeader className="px-3 py-3 text-right">Amount</TableCell><TableCell isHeader className="px-3 py-3">Account</TableCell><TableCell isHeader className="px-3 py-3">Created by</TableCell><TableCell isHeader className="px-3 py-3">Updated by</TableCell><TableCell isHeader className="px-3 py-3 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={12} className="border border-gray-500 text-center px-1 py-1 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="border border-gray-500 text-center px-1 py-1 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <TableRow key={payment.id ?? index} className="border-t border-gray-100 transition-colors hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.03]">
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400 min-w-min">
                        {payment.paymentDate}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentRefNo}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentType}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.invoiceRefNo ? payment.invoiceRefNo : "-"}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.party?.name}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.currency}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.amountPaid}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.bank?.accountName}
                      </TableCell>
                      
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.createdByUser ? payment.createdByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.updatedByUser ? payment.updatedByUser : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-1 py-1 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems anchor="bottom end" portal className="z-[100] w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {/* <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleView(payment)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    View
                                  </button>
                                )}
                              </MenuItem> */}
                              {/* { user?.role?.permissions?.some(p => p.action === "view_invoice" || p.action === "view_purchase" || p.action === "view_sale") && ( */}
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleView(payment)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                      View
                                    </button>
                                  )}
                                </MenuItem>
                              {/* )} */}

                              { user?.role?.permissions?.some(p => p.action === "edit_payment") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(payment)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>
                              )}

                              { user?.role?.permissions?.some(p => p.action === "delete_payment") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        openModal();
                                      }}
                                      className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
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
          

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={() => setCurrentPage(Math.min(Math.max(Number(pageInput) || 1, 1), totalPages || 1))} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {totalPages || 1}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= (totalPages || 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setCurrentPage(totalPages || 1)} disabled={currentPage >= (totalPages || 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this supplier?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
