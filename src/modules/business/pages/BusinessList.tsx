import { useEffect, useMemo, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { toast } from "react-toastify";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import {
  PaginationControl,
  SearchControl,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { useNavigate } from "react-router-dom";
import { useModal } from "../../../hooks/useModal.ts";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { Business } from "../features/businessTypes.ts";
import { selectBusinessStatus, selectAllBusiness } from "../features/businessSelectors.ts";
import { fetchAll, destroy } from "../features/businessThunks.ts";

export default function BusinessList() {
  const dispatch = useDispatch<AppDispatch>(); // Use the typed dispatch hook
  const navigate = useNavigate();

  const businesses = useSelector(selectAllBusiness);
  const status = useSelector(selectBusinessStatus);

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  

  useEffect(() => {
    dispatch(fetchAll());
  }, [dispatch]);

  // Filter users by name/email
  const filteredBusinesses = useMemo(() => {
    if (status !== 'succeeded') return [];
    return businesses.filter((business) =>
      (business.businessName ?? '').toLowerCase().includes(filterText.toLowerCase()) ||
      (business.ownerName ?? '').toLowerCase().includes(filterText.toLowerCase()) ||
      (business.phoneNumber ?? '').toLowerCase().includes(filterText.toLowerCase()) ||
      (business.email ?? '').toLowerCase().includes(filterText.toLowerCase())
    );
  }, [businesses, filterText, status]);

  // Sort by ID
  const sortedBusinesses = useMemo(() => {
    return [...(filteredBusinesses ?? [])].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }, [filteredBusinesses]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedBusinesses.length / itemsPerPage) || 1;

  // Paginate
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedBusinesses.slice(start, start + itemsPerPage);
  }, [sortedBusinesses, currentPage, itemsPerPage]);

  const handleView = (business: Business) => {
    console.log("Viewing user:", business);
    navigate(`/business/view/${business.id}`);
  };

  const handleEdit = (business: Business) => {
    navigate(`/business/edit/${business.id}`);
  };

  const handleDelete = async () => {
    if (!selectedBusiness) return;

    try {
        await dispatch(destroy(selectedBusiness.id!)).unwrap();
        toast.success("Business deleted successfully");
    } catch (error: any) {
        toast.error(error);
    } finally {
        closeAndResetModal();
    }
    dispatch(fetchAll());
  };

  const closeAndResetModal = () => {
    setSelectedBusiness(null);
    closeModal();
  };

  // Reset current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <>
      <PageMeta
        title="Business List Table"
        description="Business Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Business List" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full">
            {/* Search Input */}
            <SearchControl value={filterText} onChange={setFilterText} />

            {/* Table */}
            <Table>
              <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Business Name</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Owner Name</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Email</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Phone</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">isActive</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : paginatedBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBusinesses.map((business, index) => (
                    <TableRow key={business.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {business.businessName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {business.ownerName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {business.email}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {business.phoneCode && business.phoneNumber ? business.phoneCode + business.phoneNumber : ''}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {business.isActive ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm overflow-visible">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleView(business)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    View
                                  </button>
                                )}
                              </MenuItem>
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEdit(business)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit
                                  </button>
                                )}
                              </MenuItem>
                              
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedBusiness(business); 
                                        openModal();   
                                      }}
                                      className={`${
                                        active ? 'bg-red-100 text-red-700' : 'text-red-600'
                                      } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
                              
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
        title="Are you sure you want to delete this user?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
