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

import { User } from "../features/userTypes.ts";
import { selectUsers, selectUserStatus } from "../features/userSelectors.ts";
import { fetchUsers, deleteUser } from "../features/userThunks.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";

export default function UserTable() {
  const dispatch = useDispatch<AppDispatch>(); // Use the typed dispatch hook
  const navigate = useNavigate();

  const authUser = useSelector(selectUser);
  const users = useSelector(selectUsers(Number(authUser?.business?.id)));
  const status = useSelector(selectUserStatus);

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter users by name/email
  const filteredUsers = useMemo(() => {
    if (status !== 'succeeded') return [];

    const search = filterText.toLowerCase().trim();
    if (!search) return users;

    return users.filter(
      
      (user) =>
        user.name.toLowerCase().includes(filterText.toLowerCase()) ||
        user.email.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [users, filterText, status]);

  const sortedUsers = useMemo(() => {
    return [...(filteredUsers ?? [])].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }, [filteredUsers]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;

  // Paginate
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  const handleView = (user: User) => {
    navigate(`/user/profile/view/${user.id}`);
  };

  const handleEdit = (user: User) => {
    navigate(`/user/edit/${user.id}`);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await dispatch(deleteUser(selectedUser.id!)).unwrap();
      toast.success("User deleted successfully");
      closeAndResetModal();
      dispatch(fetchUsers());
    } catch (error) {
      toast.error("Failed to delete user");
    }
    
  };

  const closeAndResetModal = () => {
    setSelectedUser(null);
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
        title="User List Table"
        description="Users Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="User List" />

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
                  <TableCell isHeader className="text-center px-4 py-2">User Name</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Email</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Role</TableCell>
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
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.filter(user => user.role?.name.toLowerCase() !== "root").map((user, index) => (
                    <TableRow key={index} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.business?.businessName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.role?.name ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {user.isActive ? 'Yes' : 'No'}
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
                                    onClick={() => handleView(user)}
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
                                    onClick={() => handleEdit(user)}
                                    className={`${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit
                                  </button>
                                )}
                              </MenuItem>
                              {authUser?.id != user.id ? (
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user); // ✅ Set user
                                        openModal();           // ✅ Then open modal
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
                              ): (
                                <span className="text-gray-500 italic"></span>
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
        title="Are you sure you want to delete this user?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
