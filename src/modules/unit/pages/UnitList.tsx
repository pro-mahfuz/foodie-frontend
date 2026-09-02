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
import { Unit } from "../features/unitTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectUnitStatus, selectAllUnitByBusiness } from "../features/unitSelectors.ts";
import { createUnit, updateUnit, fetchAllUnit, destroyUnit } from "../features/unitThunks.ts";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";

export default function UnitList() {
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  const [formData, setFormData] = useState<Unit>({
    businessId: 0,
    name: '',
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
  const [pageInput, setPageInput] = useState("1");
  const [unitsPerPage, setUnitsPerPage] = useState<number>(10);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    dispatch(fetchAllUnit());
  }, [dispatch]);

  const units = useSelector(selectAllUnitByBusiness(user?.business?.id || 0));
  const status = useSelector(selectUnitStatus);

  const filteredData = useMemo(() => {
    return units.filter(unit =>
      unit?.name?.toLowerCase().includes(filterText.toLowerCase())
      
    );
  }, [units, filterText]);

  const totalPages = Math.ceil(filteredData.length / unitsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * unitsPerPage;
    return filteredData.slice(start, start + unitsPerPage);
  }, [filteredData, currentPage, unitsPerPage]);

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
      isActive: true,
    });
    setSelectedUnit(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("formData: ", formData);
      if (selectedUnit) {
        await dispatch(updateUnit({ ...formData, id: selectedUnit.id })).unwrap();
        toast.success("Unit updated successfully!");
      } else {
        await dispatch(createUnit(formData)).unwrap();
        toast.success("Unit created successfully!");
      }
      resetForm();
      dispatch(fetchAllUnit()); // refresh list
    } catch (err) {
      toast.error("Failed to save unit.");
    }
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      ...unit
    });
  };

  const handleDelete = async () => {
    if (!selectedUnit) return;
    try {
      await dispatch(destroyUnit(selectedUnit.id!)).unwrap();
      toast.success("Unit deleted successfully");
      closeAndResetModal();
      dispatch(fetchAllUnit()); // refresh list
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  };

  const closeAndResetModal = () => {
    setSelectedUnit(null);
    closeModal();
  };

  const handleTableStatusChange = async (unit: Unit, isActive: boolean) => {
    try {
      await dispatch(updateUnit({ ...unit, isActive })).unwrap();
      toast.success(`Unit marked ${isActive ? "active" : "inactive"}.`);
      dispatch(fetchAllUnit());
    } catch {
      toast.error("Failed to update unit status.");
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const refreshUnits = () => {
    setFilterText("");
    setCurrentPage(1);
    dispatch(fetchAllUnit());
  };

  const applyPage = () => {
    const requestedPage = Number(pageInput);
    const lastPage = Math.max(totalPages, 1);
    setCurrentPage(Number.isFinite(requestedPage) ? Math.min(Math.max(Math.floor(requestedPage), 1), lastPage) : 1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Units" description="Create and manage inventory units" />
      <PageBreadcrumb pageTitle="Units" />

      <section className="mb-6 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Inventory setup</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{selectedUnit ? "Edit unit" : "Create a unit"}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add the measurement units used across your inventory.</p>
          </div>
          {selectedUnit && <button onClick={resetForm} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]">Cancel edit</button>}
        </div>
        <div className="p-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">

                <div>
                  <Label>Unit Name</Label>
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
                    styles={{ ...selectStyles, menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }) }}
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <div className="flex items-end">
                  <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
                    <PlusIcon className="h-4 w-4" /> {selectedUnit ? "Save changes" : "Create unit"}
                  </button>
                </div>
              </div>
            </form>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Unit catalog</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{filteredData.length} of {units.length} units</p>
            </div>
            <button onClick={refreshUnits} className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button>
          </div>
          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <div className="mb-3 flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h3><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Filter the catalog by unit name.</p></div>{filterText && <button type="button" onClick={() => { setFilterText(""); setCurrentPage(1); }} className="shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filter</button>}</div>
            <label className="block max-w-xs text-xs font-medium text-gray-600 dark:text-gray-300">Unit name<input value={filterText} onChange={(event) => { setFilterText(event.target.value); setCurrentPage(1); }} placeholder="Enter unit name" className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
          </div>

          <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
            <Table className="min-w-[560px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_td]:px-1 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-3 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="px-4 py-3 first:pl-6">#</TableCell>
                  <TableCell isHeader className="px-4 py-3">Unit name</TableCell>
                  <TableCell isHeader className="px-4 py-3">Status</TableCell>
                  <TableCell isHeader className="text-center">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-300">
                      Loading units...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-300">
                      No units match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((unit, index) => (
                    <TableRow key={unit.id} className="relative z-0 transition-colors hover:z-10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                      <TableCell className="px-4 py-3 text-sm text-gray-400 first:pl-6">
                        {(currentPage - 1) * unitsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {unit.name}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <select value={unit.isActive ? "active" : "inactive"} onChange={(event) => handleTableStatusChange(unit, event.target.value === "active")} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${unit.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-300'}`}><option value="active">Active</option><option value="inactive">Inactive</option></select>
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
                                    onClick={() => handleEdit(unit)}
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
                                      setSelectedUnit(unit);
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

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={unitsPerPage} onChange={(event) => { setUnitsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button type="button" onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {Math.max(totalPages, 1)}</span><button type="button" onClick={() => setCurrentPage((page) => Math.min(page + 1, Math.max(totalPages, 1)))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button type="button" onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
          </div>
      </section>

      <ConfirmationModal
        isOpen={isOpen}
        title="Delete this unit?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </div>
  );
}
