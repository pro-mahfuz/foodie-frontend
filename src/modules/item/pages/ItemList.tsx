import { FormEvent, ChangeEvent, useMemo, useState, useEffect } from "react";

import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Select, { SingleValue } from "react-select";
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

import { selectStyles, statusOptions, OptionBooleanType } from "../../types.ts";
import { Item } from "../features/itemTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectItemStatus, selectAllItemByBusiness } from "../features/itemSelectors.ts";
import { createItem, updateItem, fetchAllItem, destroyItem } from "../features/itemThunks.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";

export default function ItemList() {
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const [formData, setFormData] = useState<Item>({
    businessId: 0,
    categoryId: 0,
    name: '',
    unit: '',
    vatPercentage: 0,
    isActive: true,
    system: 1,
    itemVat: 0
  });

  useEffect(() => {
    if (user?.business?.id) {
      setFormData((prev) => ({
        ...prev,
        businessId: user.business!.id,
      }));
    }
  }, [user]);

  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [itemNameFilter, setItemNameFilter] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    dispatch(fetchAllItem());
    dispatch(fetchAllCategory());
  }, [dispatch]);

  const items = useSelector(selectAllItemByBusiness(user?.business?.id || 0));
  const status = useSelector(selectItemStatus);
  const categories = useSelector(selectAllCategory);
  const categoryOptions = useMemo(
    () => categories
      .filter((category) => category.name.toLowerCase() !== "bill")
      .map((category) => ({ label: category.name, value: category.id })),
    [categories],
  );

  const filteredData = useMemo(() => {
    return items.filter((item) =>
      (!categoryFilter || item.categoryId === categoryFilter) &&
      (!itemNameFilter || item.name?.toLowerCase().includes(itemNameFilter.toLowerCase()))
    );
  }, [items, categoryFilter, itemNameFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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
      categoryId: 0,
      name: '',
      unit: '',
      isActive: true,
      system: 1,
      vatPercentage: 0,
      itemVat: 0
    });
    setSelectedItem(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await dispatch(updateItem({ ...formData, id: selectedItem.id })).unwrap();
        toast.success("Item updated successfully!");
      } else {
        await dispatch(createItem(formData)).unwrap();
        toast.success("Item created successfully!");
      }
      resetForm();
      dispatch(fetchAllItem()); // refresh list
    } catch (err) {
      toast.error("Failed to save item.");
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      categoryId: item.categoryId || 0,
    });
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await dispatch(destroyItem(selectedItem.id!)).unwrap();
      toast.success("Item deleted successfully");
      closeAndResetModal();
      dispatch(fetchAllItem()); // refresh list
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const closeAndResetModal = () => {
    setSelectedItem(null);
    closeModal();
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const refreshItems = () => {
    setCategoryFilter("");
    setItemNameFilter("");
    setCurrentPage(1);
    dispatch(fetchAllItem());
  };

  const handleTableStatusChange = async (item: Item, isActive: boolean) => {
    try {
      await dispatch(updateItem({ ...item, isActive })).unwrap();
      toast.success(`Item marked ${isActive ? "active" : "inactive"}.`);
      dispatch(fetchAllItem());
    } catch {
      toast.error("Failed to update item status.");
    }
  };

  const applyPage = () => {
    const requestedPage = Number(pageInput);
    const lastPage = Math.max(totalPages, 1);
    setCurrentPage(Number.isFinite(requestedPage) ? Math.min(Math.max(Math.floor(requestedPage), 1), lastPage) : 1);
  };

  return (
    <>
      <PageMeta title="Items" description="Create and manage inventory items" />
      

      <div className="mx-auto max-w-7xl space-y-6">
        <PageBreadcrumb pageTitle="Items" />
      <section className="mb-6 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Inventory catalog</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{selectedItem ? "Edit item" : "Create an item"}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Define how this item is organized, measured, and taxed.</p>
          </div>
          {selectedItem && <button onClick={resetForm} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]">Cancel edit</button>}
        </div>
        <div className="p-5 sm:p-6">
        <div className="flex">
          <div className="w-full">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                {/* Category */}
                <div>
                  <Label>Select Category</Label>
                  <Select
                    options={categoryOptions}
                    placeholder="Select category"
                    value={
                      categoryOptions.find((option) => option.value === formData.categoryId) || null
                    }
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: selectedOption?.value ?? 0,
                      }))
                    }
                    isClearable
                    styles={{ ...selectStyles, menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div>
                  <Label>Item Name</Label>
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
                  <Label>Unit</Label>
                  <Input
                    type="text"
                    name="unit"
                    placeholder="Enter unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Vat (%)</Label>
                  <Input
                    type="text"
                    name="vatPercentage"
                    placeholder="Enter Vat"
                    value={formData.vatPercentage}
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

                <div className="flex items-end">
                  <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
                    <PlusIcon className="h-4 w-4" /> {selectedItem ? "Save changes" : "Create item"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Item catalog</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{filteredData.length} of {items.length} items</p>
            </div>
            <button onClick={refreshItems} className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>
          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div><h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h3><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Filter the catalog by category or item name.</p></div>
              {(categoryFilter || itemNameFilter) && <button type="button" onClick={() => { setCategoryFilter(""); setItemNameFilter(""); setCurrentPage(1); }} className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filter</button>}
            </div>
            <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Category
                <Select aria-label="Filter items by category" options={categoryOptions} value={categoryOptions.find((option) => option.value === categoryFilter) ?? null} onChange={(option) => { setCategoryFilter(option?.value ?? ""); setCurrentPage(1); }} placeholder="All categories" isClearable styles={{ ...selectStyles, control: (base: Record<string, unknown>, state: unknown) => ({ ...selectStyles.control(base, state), padding: 0 }) }} className="mt-1" classNamePrefix="react-select" />
              </label>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Item name
                <input aria-label="Filter by item name" value={itemNameFilter} onChange={(event) => { setItemNameFilter(event.target.value); setCurrentPage(1); }} placeholder="Enter item name" className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" />
              </label>
            </div>
          </div>
          <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">

            <Table className="min-w-[760px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_td]:px-1 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-3 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 first:pl-6">#</TableCell>
                  <TableCell isHeader className="px-4 py-3">Category</TableCell>
                  <TableCell isHeader className="px-4 py-3">Item name</TableCell>
                  <TableCell isHeader className="px-4 py-3">Unit</TableCell>
                  <TableCell isHeader className="px-4 py-3">VAT</TableCell>
                  <TableCell isHeader className="px-4 py-3">Status</TableCell>
                  <TableCell isHeader className="text-center">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-300">
                      Loading items...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-300">
                      No items match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className="relative z-0 transition-colors hover:z-10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                      <TableCell className="px-4 py-3 text-sm text-gray-400 first:pl-6">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.category?.name || '—'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {item.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.unit}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.vatPercentage}%
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <select value={item.isActive ? "active" : "inactive"} onChange={(event) => handleTableStatusChange(item, event.target.value === "active")} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${item.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-300'}`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </TableCell>

                      <TableCell className="relative z-20 overflow-visible text-center">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems anchor="bottom end" portal className="z-[100] w-36 origin-top-right rounded-lg border border-gray-100 bg-white p-1 shadow-xl focus:outline-none dark:border-white/[0.1] dark:bg-gray-900">
                            <div className="py-1">
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className={`${active ? 'bg-gray-50 dark:bg-white/[0.06]' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}
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
                                      setSelectedItem(item);
                                      openModal();
                                    }}
                                    className={`${active ? 'bg-rose-50 dark:bg-rose-500/10' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600`}
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

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page
              <select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">
                {[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300">
              <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button>
              <button type="button" onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button>
              <span>Page</span>
              <input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" />
              <span>of {Math.max(totalPages, 1)}</span>
              <button type="button" onClick={() => setCurrentPage((page) => Math.min(page + 1, Math.max(totalPages, 1)))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button>
              <button type="button" onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button>
            </div>
          </div>
      </section>
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
