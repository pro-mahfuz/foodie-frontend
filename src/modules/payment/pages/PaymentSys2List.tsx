import { useMemo, useState, useEffect } from "react";
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

import { toast } from "react-toastify";
import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { Payment } from "../features/paymentTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectPaymentStatus, selectAllPayments_Sys2 } from "../features/paymentSelectors.ts";
import { fetchAll, destroy } from "../features/paymentThunks.ts";

export default function PaymentSys2List() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const payments = useSelector(selectAllPayments_Sys2);
  const status = useSelector(selectPaymentStatus);

  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState('1');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    dispatch(fetchAll());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    const search = filterText.toLowerCase();
    return payments.filter((p) => {
      const paymentDate = p.paymentDate ?? "";
      const vatInvoiceNo = p.vatInvoiceRefNo ?? "";
      const paymentNo = p.paymentRefNo ?? "";

      return (
        paymentDate.toLowerCase().includes(search) ||
        vatInvoiceNo.toLowerCase().includes(search) ||
        paymentNo.toLowerCase().includes(search) 
      );
    }).sort((a, b) => {
      const dateDifference = new Date(b.paymentDate ?? 0).getTime() - new Date(a.paymentDate ?? 0).getTime();
      return dateDifference || Number(b.id ?? 0) - Number(a.id ?? 0);
    });
  }, [payments, filterText]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleEdit = (payment: Payment) => {
    navigate(`/paymentSys2/${payment.id}/edit`);
  };

  const handleView = (payment: Payment) => {
    navigate(`/paymentSys2/${payment.id}/view`);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      await dispatch(destroy(selectedPayment.id!)).unwrap();
      toast.success("Payment deleted successfully");
      
    } catch (error) {
      toast.error("Failed to delete payment");
    }
    closeAndResetModal();
    dispatch(fetchAll());
  };

  const closeAndResetModal = () => {
    setSelectedPayment(null);
    closeModal();
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  const handleRefresh = () => {
    setFilterText('');
    setCurrentPage(1);
    dispatch(fetchAll());
  };

  return (
    <>
      <PageMeta
        title="Payment List"
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Payment List" />

      <div className="mx-auto max-w-7xl">

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"><div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Payments</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Payment System 2</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{filteredData.length} payment records found.</p></div><div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
          >
            <ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={() => {navigate('/paymentSys2/create')}}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <PlusIcon className="h-4 w-4" /> Create payment
          </button>
            
        </div></div></section>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          
            <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02]"><div className="mb-2 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Search by payment date or reference.</p></div>{filterText && <button type="button" onClick={() => { setFilterText(''); setCurrentPage(1); }} className="text-sm font-medium text-brand-600">Clear filter</button>}</div><input value={filterText} onChange={(event) => { setFilterText(event.target.value); setCurrentPage(1); }} placeholder="Search payment date or reference" className="h-9 w-full max-w-sm rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></div>

            <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
              <Table className="min-w-[1150px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_td]:px-1 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-3 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
            <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                  <TableRow className="border border-gray-500">
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Reference No</TableCell>
                    {/* <TableCell isHeader className="text-center px-4 py-2">Category</TableCell> */}
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Payment Type</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Invoice Ref</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Party Name</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Payment Currency</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Amount</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Payment Account</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Created By</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Updated By</TableCell>
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Action</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {status === 'loading' ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                        Loading data...
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-4 text-gray-500 dark:text-gray-300">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((payment, index) => (
                      <TableRow key={payment.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {((Number((filteredData.length / itemsPerPage)) - (currentPage - 1)) * itemsPerPage - index).toFixed(0)}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.paymentDate}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.paymentRefNo}
                        </TableCell>
                        {/* <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {payment.category?.name}
                        </TableCell> */}
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.paymentType}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.vatInvoiceRefNo ? payment.vatInvoiceRefNo : "-"}
                        </TableCell>
                        
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.party?.name}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.currency}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.amountPaid}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.bank?.accountName}
                        </TableCell>
                        
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.createdByUser ? payment.createdByUser : "-"}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {payment.updatedByUser ? payment.updatedByUser : "-"}
                        </TableCell>
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm overflow-visible">
                          <Menu as="div" className="relative inline-block text-left">
                            <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                              Actions
                              <ChevronDownIcon className="h-4 w-4 text-white" />
                            </MenuButton>

                            <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
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

                                { user?.role?.permissions?.some(p => p.action === "edit_payment_2") && (
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

                                { user?.role?.permissions?.some(p => p.action === "delete_payment_2") && (
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
          

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label><div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40">First</button><button onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page</span><input value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={() => setCurrentPage(Math.min(Math.max(Number(pageInput) || 1, 1), Math.max(totalPages, 1)))} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center" /><span>of {Math.max(totalPages, 1)}</span><button onClick={() => setCurrentPage((page) => Math.min(page + 1, Math.max(totalPages, 1)))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40">Next</button><button onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40">Last</button></div></div>
        </section>
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
