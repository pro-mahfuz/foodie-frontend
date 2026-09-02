import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
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

import { Payment } from "../features/paymentTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import {
  selectPaymentStatus,
  selectAllExpense,
} from "../features/paymentSelectors.ts";
import { fetchAll, destroy } from "../features/paymentThunks.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";

export default function ExpenseList() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if(payments.length === 0){
      dispatch(fetchAll());
    }
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const payments = useSelector(selectAllExpense);
  const status = useSelector(selectPaymentStatus);
  const categories = useSelector(selectAllCategory);

  const filteredData = useMemo(() => {
    if (!filterText) return payments;
    const text = filterText.toLowerCase();
    return payments.filter(
      (p) =>
        p.paymentRefNo?.toLowerCase().includes(text) ||
        p.paymentDate?.toLowerCase().includes(text) ||
        p.paymentType?.toLowerCase().includes(text) ||
        p.container?.containerNo?.toLowerCase().includes(text) ||
        p.note?.toLowerCase().includes(text)
    );
  }, [payments, filterText]);

  console.log("filteredData: ", filteredData);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);


  const handleEdit = (payment: Payment) => {

    navigate(`/expense/${payment.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedPayment) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      await dispatch(destroy(selectedPayment.id!)).unwrap();
      toast.success("Payment deleted successfully");
      closeAndResetModal();
    } catch (error) {
      toast.error("Failed to delete payment");
    }
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

  return (
    <>
      <PageMeta
        title="Expense List"
        description="Expense Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Expense List" />

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
            onClick={() => {navigate('/expense/create')}}
            className="bg-lime-600 text-white px-2 py-1 rounded-full hover:bg-lime-900 mr-4"
          >
            Create
          </button>
            
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          
          <SearchControl value={filterText} onChange={setFilterText} placeHolder="Expense Type / Container No / Details" />

          <div className="px-4">
            <Table>
              <TableHeader className="border border-gray-500 dark:border-white/[0.05] bg-sky-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow className="border border-gray-500">
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Sl</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Date</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Reference No</TableCell>
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Expense Type</TableCell>

                  {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Container No</TableCell>
                  )}

                  <TableCell isHeader className="border border-gray-500 text-center px-4 py-1">Expense Details</TableCell>
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
                    <TableCell colSpan={12} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="border border-gray-500 text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((payment, index) => (
                    <TableRow key={payment.id} className="border border-gray-500 dark:border-white/[0.05]">
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {((Number((filteredData.length / itemsPerPage)) - (currentPage - 1)) * itemsPerPage - index).toFixed(0)}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentDate}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentRefNo}
                      </TableCell>

                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.paymentType}
                      </TableCell>

                      {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && (
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.container?.containerNo ?? "---"}
                      </TableCell>
                      )}
                      
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.note}
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
                        {payment.createdByUser}
                      </TableCell>
                      <TableCell className="border border-gray-500 text-center px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
                        {payment.updatedByUser}
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

                              { user?.role?.permissions?.some(p => p.action === "edit_expense") && (
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

                              { user?.role?.permissions?.some(p => p.action === "delete_expense") && (
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
