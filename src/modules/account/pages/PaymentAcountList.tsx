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
import { Account } from "../features/accountTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectAccountStatus, selectAllAccountByBusiness } from "../features/accountSelectors.ts";
import { createAccount, updateAccount, fetchAllAccount, destroyAccount } from "../features/accountThunks.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";

export default function PaymentAcountList() {
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const [formData, setFormData] = useState<Account>({
    businessId: 0,
    accountName: '',
    accountNo: '',
    address: '',
    currency: '',
    openingBalance: 0,
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
  const [accountPerPage, setAccountPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(fetchAllAccount());
  }, [dispatch]);

  const paymentAccounts = useSelector(selectAllAccountByBusiness(Number(user?.business?.id)));
  console.log("paymentAccounts: ", paymentAccounts);
  const status = useSelector(selectAccountStatus);


  const filteredData = useMemo(() => {
    if (!paymentAccounts) return [];

    const search = filterText.toLowerCase().trim();
    if (!search) return paymentAccounts; // return everything if no filter

    return paymentAccounts.filter(
        (paymentAccount) => paymentAccount?.accountName?.toLowerCase().includes(search) || paymentAccount?.accountNo?.toLowerCase().includes(search)
    );
  }, [paymentAccounts, filterText]);

  const totalPages = Math.ceil(filteredData.length / accountPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * accountPerPage;
    return filteredData.slice(start, start + accountPerPage);
  }, [filteredData, currentPage, accountPerPage]);
  
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
      accountName: '',
      accountNo: '',
      address: '',
      currency: '',
      openingBalance: 0,
      isActive: true,
    });
    setSelectedAccount(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("formData: ", formData);
    try {
      if (selectedAccount) {
        await dispatch(updateAccount({ ...formData, id: selectedAccount.id })).unwrap();
        toast.success("Account updated successfully!");
      } else {
        await dispatch(createAccount(formData)).unwrap();
        toast.success("Account created successfully!");
      }
      resetForm();
      dispatch(fetchAllAccount()); // refresh list
    } catch (err) {
      toast.error("Failed to save account.");
    }
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setFormData({
      ...account,
      businessId: user?.business?.id
    });
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      await dispatch(destroyAccount(selectedAccount.id!)).unwrap();
      toast.success("Account deleted successfully");
      dispatch(fetchAllAccount()); // refresh list
    } catch (error: any) {
      toast.error(error);
    }
    closeAndResetModal();
  };

  const closeAndResetModal = () => {
    setSelectedAccount(null);
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
        title="Account List Table"
        description="Account Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Account Create & List" />

      <div className="p-4 mb-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 space-y-4">
        <h2 className="text-lg font-semibold">Create Account</h2>
        <div className="flex">
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

                <div>
                  <Label>Payment Account Name</Label>
                  <Input
                    type="text"
                    name="accountName"
                    placeholder="Enter account name"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input
                    type="text"
                    name="accountNo"
                    placeholder="Enter account no"
                    value={formData.accountNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Location / Address</Label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    name="currency"
                    placeholder="Enter currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Opening Balance</Label>
                  <Input
                    type="text"
                    name="openingBalance"
                    placeholder="0"
                    value={formData.openingBalance}
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
                  <TableCell isHeader className="text-center px-4 py-2">Account Name</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Account Number</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Location / Address</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Currency</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Opening Balance</TableCell>
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
                  paginatedData.map((account, index) => (
                    <TableRow key={account.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * accountPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {account.accountName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {account.accountNo}
                      </TableCell>
                      
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {account.address}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {account.currency}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {Number(account.openingBalance) > 0 ? Number(account.openingBalance) : 0}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {account.isActive ? 'Yes' : 'No'}
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
                                    onClick={() => handleEdit(account)}
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
                                      setSelectedAccount(account);
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
            itemsPerPage={accountPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setAccountPerPage}
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
