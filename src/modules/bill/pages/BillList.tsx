import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import {
  PaginationControl,
  SearchControl,
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

import { Invoice } from "../../invoice/features/invoiceTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import {
  selectInvoiceStatus,
  selectAllInvoiceByType
} from "../../invoice/features/invoiceSelectors.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllInvoice, destroy } from "../../invoice/features/invoiceThunks.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function BillList() {
  const { invoiceType } = useParams() as { invoiceType: 'purchase' | 'sale' };
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const invoices = useSelector(selectAllInvoiceByType(invoiceType));
  const status = useSelector(selectInvoiceStatus);
  const categories = useSelector(selectAllCategory);

  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    dispatch(fetchAllInvoice());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    return invoices.filter((invoice) =>
      invoice?.invoiceType?.toLowerCase().includes(filterText.toLowerCase()) ||
      String(invoice.invoiceNo).toLowerCase().includes(filterText.toLowerCase()) ||
      invoice.party?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      invoice.note.toLowerCase().includes(filterText.toLowerCase()) ||
      invoice.items?.some((item) =>
        item.container?.containerNo?.toLowerCase().includes(filterText.toLowerCase())
      ) ||
      invoice.items?.some((item) =>
        item.name?.toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [invoices, filterText]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleView = (invoice: Invoice) => {
    navigate(`/bill/${invoice.id}/view`);
  };

  const handleEdit = (invoice: Invoice) => {
    navigate(`/bill/${invoice.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      await dispatch(destroy(selectedInvoice.id!)).unwrap();
      
      toast.success("Invoice deleted successfully");
      dispatch(fetchAllInvoice());
    } catch (error: any) {
      toast.error(error);
    }
    closeAndResetModal();
    
  };

  const closeAndResetModal = () => {
    setSelectedInvoice(null);
    closeModal();
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <>
      <PageMeta
        title={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`}
        description="Invoice Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} List`} />

      <div className="mb-4 flex justify-start">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
          >
              Back
          </button>

          <button
              onClick={() => {setCurrentPage(1)}}
              className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
          >
              Refresh
          </button>

          <button
            onClick={() => {navigate('/bill/create')}}
            className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
          >
            Create
          </button>
            
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          
          <SearchControl value={filterText} onChange={setFilterText} />

          <div className="px-4">
            <Table>
              <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow className="border border-gray-500">
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Invoice No</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Category</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Type</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>

                  {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                    <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Container No</TableCell>
                  )}

                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Provider Name</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Description</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Quantity</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Unit</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Currency</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Grand Total</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Amount (Due)</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Created By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Updated By</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={16 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16 - (categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? 1: 0)} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((invoice, index) => (
                    <TableRow key={invoice.id} className="border border-gray-500 dark:border-white/[0.05]">
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {((Number((filteredData.length / itemsPerPage)) - (currentPage - 1)) * itemsPerPage - index).toFixed(0)}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.invoiceNo}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.category?.name}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.invoiceType}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.date}
                      </TableCell>

                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) ? (
                        <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                          {invoice.items.map((item, idx) => (
                            <span key={`${item.container?.containerNo}-${idx}`}>
                              {item.container?.containerNo}
                              <br />
                            </span>
                          ))}
                        </TableCell>
                      ) : ""}

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.party?.name}
                      </TableCell>
                      
                      {/* Item/Description */}
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

                      {/* Quantity */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          {invoice.items.map((item, idx) => (
                            <span key={`q-${item.id || idx}`}>
                              {item.quantity}
                              <br />
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Stock In / Stock Out */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          {invoice.items.map((item, idx) => (
                            <span key={`q-${item.id || idx}`}>
                              {item.unit}
                              <br />
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Unit or Currency */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        <div>{invoice.currency}</div>
                      </TableCell>

                      {/* Grand Total */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.grandTotal}
                      </TableCell>

                      {/* Payment Due */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {categories.some((c) => c.name.toLowerCase() === "currency") ? (
                          <div
                            className={
                              (invoiceType === "purchase" || invoice.invoiceType === "clearance_bill")
                                ? Number(invoice.grandTotal) - Number(invoice.paymentOutSum) > 0
                                  ? "text-yellow-600"
                                  : Number(invoice.grandTotal) - Number(invoice.paymentOutSum) < 0
                                  ? "text-red-600"
                                  : ""
                                : Number(invoice.grandTotal) - Number(invoice.paymentInSum) > 0
                                ? "text-red-600"
                                : Number(invoice.grandTotal) - Number(invoice.paymentInSum) < 0
                                ? "text-yellow-600"
                                : ""
                            }
                          >
                            {(invoiceType === "purchase" || invoice.invoiceType === "clearance_bill")
                              ? invoice.totalAmount - Number(invoice.paymentOutSum) > 0
                                ? invoice.totalAmount - Number(invoice.paymentOutSum)
                                : "-"
                              : invoice.totalAmount - Number(invoice.paymentInSum) !== 0
                                ? invoice.totalAmount - Number(invoice.paymentInSum)
                                : "-"
                            }
                          </div>
                        ) : 
                          <div
                            className={
                              (invoiceType === "purchase" || invoice.invoiceType === "clearance_bill")
                              ? Number(invoice.grandTotal) - Number(invoice.paymentOutSum) > 0
                                ? "text-yellow-600"
                                : Number(invoice.grandTotal) - Number(invoice.paymentOutSum) < 0
                                ? "text-red-600"
                                : ""
                              : Number(invoice.grandTotal) - Number(invoice.paymentInSum) > 0
                              ? "text-red-600"
                              : Number(invoice.grandTotal) - Number(invoice.paymentInSum) < 0
                              ? "text-yellow-600"
                              : ""
                            }
                          >
                            {(invoiceType === "purchase" || invoice.invoiceType === "clearance_bill")
                              ? Number(invoice.grandTotal) - Number(invoice.paymentOutSum) > 0
                                ? Number(invoice.grandTotal) - Number(invoice.paymentOutSum)
                                : "-"
                              : Number(invoice.grandTotal) - Number(invoice.paymentInSum) !== 0
                              ? Number(invoice.grandTotal) - Number(invoice.paymentInSum)
                              : "-"
                            }
                          </div>
                        }
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.createdByUser?.name ?? "-"}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {invoice.updatedByUser?.name ?? "-"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">

                              { user?.role?.permissions?.some(p => p.action === "view_invoice" || p.action === "view_purchase" || p.action === "view_sale") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleView(invoice)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                      View
                                    </button>
                                  )}
                                </MenuItem>
                              )}

                              { user?.role?.permissions?.some(p => p.action === "edit_invoice" || p.action === "edit_purchase" || p.action === "edit_sale") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(invoice)}
                                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>
                              )}
                              
                              { user?.role?.permissions?.some(p => p.action === "delete_invoice" || p.action === "delete_purchase" || p.action === "delete_sale") && (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedInvoice(invoice);
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
          

          {/* Pagination Controls */}
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
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
