import { FormEvent, ChangeEvent, useMemo, useState, useEffect } from "react";

import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Select, { SingleValue } from "react-select";
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

import { selectStyles, statusOptions, OptionBooleanType } from "../../types.ts";
import { Status } from "../features/statusTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectStatusStatus, selectAllStatusByBusiness } from "../features/statusSelectors.ts";
import { createStatus, updateStatus, fetchAllStatus, destroyStatus } from "../features/statusThunks.ts";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";

export default function StatusList() {
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const [formData, setFormData] = useState<Status>({
    businessId: 0,
    name: '',
    group: '',
    value: '',
    isActive: true,
  });

  useEffect(() => {
    if (user?.business?.id) {
      setFormData((prev) => ({
        ...prev,
        businessId: user.business!.id,
      }));
    }
  }, [user]);

  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  useEffect(() => {
    dispatch(fetchAllStatus());
  }, [dispatch]);

  const statusData = useSelector(selectAllStatusByBusiness(Number(user?.business?.id)));
  const status = useSelector(selectStatusStatus);


  const filteredData = useMemo(() => {
    if (!statusData) return [];

    const search = filterText.toLowerCase().trim();
    if (!search) return statusData; // return everything if no filter

    return statusData.filter(
        (status) => status?.name?.toLowerCase().includes(search)
    );
  }, [statusData, filterText]);

  const totalPages = Math.ceil(filteredData.length / statusPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * statusPerPage;
    return filteredData.slice(start, start + statusPerPage);
  }, [filteredData, currentPage, statusPerPage]);
  
  // Status handler
  const handleStatusChange = (newValue: SingleValue<OptionBooleanType>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: newValue?.value ?? true,
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      businessId: user?.business?.id ?? 0,
      name: '',
      group: '',
      value: '',
      isActive: true,
    });
    setSelectedStatus(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("formData: ", formData);
    try {
      if (selectedStatus) {
        await dispatch(updateStatus({ ...formData, id: selectedStatus.id })).unwrap();
        toast.success("Status updated successfully!");
      } else {
        await dispatch(createStatus(formData)).unwrap();
        toast.success("Status created successfully!");
      }
      resetForm();
      dispatch(fetchAllStatus()); // refresh list
    } catch (err) {
      toast.error("Failed to save status.");
    }
  };

  const handleEdit = (item: Status) => {
    setSelectedStatus(item);
    setFormData({
      ...item,
      businessId: user?.business?.id
    });
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;
    try {
      await dispatch(destroyStatus(selectedStatus.id!)).unwrap();
      toast.success("Status deleted successfully");
      closeAndResetModal();
      dispatch(fetchAllStatus()); // refresh list
    } catch (error) {
      toast.error("Failed to delete status");
    }
  };

  const closeAndResetModal = () => {
    setSelectedStatus(null);
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
        title="Status List Table"
        description="Status Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Status Create & List" />

      <div className="p-4 mb-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-lg font-semibold">Create Status</h2>
        <div className="flex">
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div>
                  <Label>Group</Label>
                  <Input
                    type="text"
                    name="group"
                    placeholder="Enter group"
                    value={formData.group}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Status Label</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Status Value</Label>
                  <Input
                    type="text"
                    name="value"
                    placeholder="Enter value"
                    value={formData.value}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Select Status</Label>
                  <Select
                    value={
                      statusOptions.find(
                        (option) => option.value === formData.isActive
                      ) || null
                    }
                    options={statusOptions}
                    placeholder="Select status"
                    onChange={handleStatusChange}
                    isClearable
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="rounded-full bg-sky-500 text-white px-4 hover:bg-sky-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full">
            <SearchControl value={filterText} onChange={setFilterText} />

            <Table>
              <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Group</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Status Label</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Status Value</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">isActive</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((status, index) => (
                    <TableRow key={status.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * statusPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {status.group}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {status.name}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {status.value}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {status.isActive ? 'Yes' : 'No'}
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
                                    onClick={() => handleEdit(status)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
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
                                      setSelectedStatus(status);
                                      openModal();
                                    }}
                                    className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
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
            itemsPerPage={statusPerPage}
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
