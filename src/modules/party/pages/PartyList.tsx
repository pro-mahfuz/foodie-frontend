import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import Label from "../../../components/form/Label";
import AsyncSelect from "react-select/async";

import { toast } from "react-toastify";
import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";

import { partyStatusOptions, selectStyles } from "../../types.ts";
import { Party } from "../features/partyTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
//import { selectUser } from "../../auth/features/authSelectors.ts";
import { selectAllPartyPagination, selectPartyStatus, selectTotalItems, selectTotalPages } from "../features/partySelectors.ts";
import { fetchPartyPaginated, deleteParty, updateParty } from "../features/partyThunks.ts";
import { selectAllCategory } from "../../category/features/categorySelectors.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import * as partyAPI from "../features/partyAPI.ts";

type PartyFilterOption = { label: string; value: number };

export default function PartyList() {
  const { partyType } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  //const authUser = useSelector(selectUser);
  const status = useSelector(selectPartyStatus);

  const totalPages = useSelector(selectTotalPages);
  const totalItems = useSelector(selectTotalItems);
  const [filterText, setFilterText] = useState<number | undefined>(undefined);
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<PartyFilterOption | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [pageInput, setPageInput] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingPartyId, setUpdatingPartyId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPartyPaginated({ page: currentPage, limit: itemsPerPage, type: partyType, filterText: filterText }));
    dispatch(fetchAllCategory());
  }, [dispatch, currentPage, itemsPerPage, partyType, filterText, refreshKey]);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  useEffect(() => {
    setFilterText(undefined);
    setSelectedPartyFilter(null);
    setCurrentPage(1);
  }, [partyType]);

  const parties = useSelector(selectAllPartyPagination);
  const categories = useSelector(selectAllCategory);
  const dropdownPartyType = partyType === 'supplier' ? 'supplier' : partyType === 'customer' ? 'customer' : 'all';
  const dropdownPartyLabel = partyType === 'supplier' ? 'supplier' : partyType === 'customer' ? 'customer' : 'party';
  const loadPartyOptions = async (inputValue: string) => {
    const data = await partyAPI.fetchPartyPaginated({
      page: 1,
      limit: 20,
      type: dropdownPartyType,
      filterText: inputValue.trim() || undefined,
      sortByName: true,
    });
    return data.parties.map((party) => ({ label: party.name, value: Number(party.id) }));
  };

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  

  // const filteredParties = useMemo(() => {
  //   const search = filterText.toLowerCase().trim();

  //   if (!search) return parties;

  //   return parties.filter((p) => {
  //     const name = p.name?.toLowerCase() ?? "";
  //     const phone = p.phoneNumber ?? "";
  //     const address = p.address?.toLowerCase() ?? "";

  //     return (
  //       name.includes(search) ||
  //       phone.includes(search) ||
  //       address.includes(search)
  //     );
  //   });
  // }, [parties, filterText]);

  // const totalPages = Math.ceil(filteredParties.length / itemsPerPage);

  // const paginatedParties = useMemo(() => {
  //   const start = (currentPage - 1) * itemsPerPage;
  //   return filteredParties.slice(start, start + itemsPerPage);
  // }, [filteredParties, currentPage, itemsPerPage]);

  const handleLedger = (party: Party) => {
    categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) 
    ? party.type === "party" ? navigate(`/ledger/1/party/${party.id}`) : navigate(`/ledger/all/list/${party.id}`)
    : party.type === "supplier" ? navigate(`/ledger/purchase/list/${party.id}`) : navigate(`/ledger/sale/list/${party.id}`)
    console.log("/ledger/all/list/${party.id}: ",party.id)
  };

  const handleView = (party: Party) => {
    navigate(`/party/view/${party.id}`);
  };

  const handleEdit = (party: Party) => {
    navigate(`/party/edit/${party.id}`);
  };

  const handleDelete = async () => {
    if (!selectedParty) return;
    try {
      await dispatch(deleteParty(selectedParty.id!)).unwrap();
      toast.success("Customer deleted successfully");
      closeAndResetModal();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const closeAndResetModal = () => {
    setSelectedParty(null);
    closeModal();
  };

  const handleStatusChange = async (party: Party, nextStatus: NonNullable<Party['status']>) => {
    if (!party.id || party.status === nextStatus) return;
    setUpdatingPartyId(party.id);
    try {
      await dispatch(updateParty({ ...party, status: nextStatus, isActive: nextStatus === 'active' })).unwrap();
      toast.success('Party status updated');
      setRefreshKey((key) => key + 1);
    } catch {
      toast.error('Failed to update party status');
    } finally {
      setUpdatingPartyId(null);
    }
  };

  const applyPage = () => {
    const page = Math.min(Math.max(Number(pageInput) || 1, 1), Math.max(totalPages, 1));
    setCurrentPage(page);
    setPageInput(String(page));
  };

  // useEffect(() => {
  //   if (currentPage > totalPages) {
  //     setCurrentPage(1);
  //   }
  // }, [totalPages, currentPage]);

  return (
    <>
      <PageMeta
        title={`${partyType ? partyType.charAt(0).toUpperCase() + partyType.slice(1).toLowerCase() : ''} List Table`}
        description="Customers Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle={`${!partyType || partyType === "all" ? "Party List" : partyType.charAt(0).toUpperCase() + partyType.slice(1).toLowerCase() + ' List'}`} />

      <section className="mb-6 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Contacts</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{!partyType || partyType === 'all' ? 'All Parties' : `${partyType.charAt(0).toUpperCase()}${partyType.slice(1)} List`}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{totalItems.toLocaleString()} records, newest first</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
            <button onClick={() => { setFilterText(undefined); setSelectedPartyFilter(null); setCurrentPage(1); setRefreshKey((key) => key + 1); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button>
            <button onClick={() => {partyType === "all" ? navigate('/party/create') : partyType === "supplier" ? navigate('/party/supplier/create') : navigate('/party/customer/create')}} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PlusIcon className="h-4 w-4" /> Add party</button>
          </div>
        </div>
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Search and select a party to filter the table.</p></div>{selectedPartyFilter && <button type="button" onClick={() => { setFilterText(undefined); setSelectedPartyFilter(null); setCurrentPage(1); }} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filter</button>}</div>
          <div className="max-w-md">
            <Label>Select {dropdownPartyLabel}</Label>
            <AsyncSelect
              key={dropdownPartyType}
              cacheOptions
              defaultOptions
              loadOptions={loadPartyOptions}
              placeholder={`Search and select ${dropdownPartyLabel}`}
              value={selectedPartyFilter}
              onChange={(selectedOption) => { setSelectedPartyFilter(selectedOption); setFilterText(selectedOption?.value); setCurrentPage(1); }}
              isClearable
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">

            {/* Table */}
            <Table className="min-w-[900px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="px-3 py-3 text-center">#</TableCell>
                  <TableCell isHeader className="px-3 py-3 text-center">Party Name</TableCell>
                  <TableCell isHeader className="px-3 py-3 text-center">Phone</TableCell>
                  <TableCell isHeader className="px-3 py-3 text-center">Email</TableCell>
                  {/* {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && ( 
                    <>
                      <TableCell isHeader className="text-center px-4 py-2">Balance</TableCell>
                    </>
                  )} */}
                  <TableCell isHeader className="px-3 py-3 text-center">Status</TableCell>
                  <TableCell isHeader className="px-3 py-3 text-center">Ledger</TableCell>
                  <TableCell isHeader className="px-3 py-3 text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading party records…
                    </TableCell>
                  </TableRow>
                ) : parties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      No party records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  parties.map((party, index) => (
                    <TableRow key={party.id} className="relative z-0 transition-colors hover:z-10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                      <TableCell className="whitespace-nowrap px-1 py-1 text-center text-sm text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>

                      <TableCell className="px-1 py-1 text-center text-sm font-medium text-gray-800 dark:text-gray-200">
                        {party.name}
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        {party.phoneCode && party.phoneNumber
                          ? `${party.phoneCode} ${party.phoneNumber}`
                          : "—"}
                      </TableCell>

                      <TableCell className="px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        {party.email ? party.email : "—"}
                      </TableCell>

                      {/* {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase())) && ( 
                        <TableCell className="border border-gray-500 text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          <div>
                            {party.summaryByCurrency && party.summaryByCurrency.length > 0 ? (
                              party.summaryByCurrency
                                // filter only meaningful balances
                                .filter(s => Math.abs(Number(s.netBalance)) >= 0.005)
                                .map((s, idx) => {
                                  const netBalance = Number(s.netBalance);
                                  const balanceClass =
                                    netBalance > 0
                                      ? "text-green-700"
                                      : netBalance < 0
                                      ? "text-red-500"
                                      : "text-gray-500";

                                  return (
                                    <div key={idx} className={balanceClass}>
                                      {netBalance != 0 ? `${s.currency}: ${netBalance.toFixed(2)}` : "--"}
                                    </div>
                                  );
                                })
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </TableCell>
                      )} */}

                      <TableCell className="px-1 py-1 text-center text-sm">
                        {(() => {
                          const partyStatus = party.status ?? (party.isActive ? 'active' : 'inactive');
                          const statusClasses = partyStatus === 'active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300' : partyStatus === 'blocked' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300' : partyStatus === 'archived' ? 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';
                          return <select aria-label={`Change status for ${party.name}`} value={partyStatus} disabled={updatingPartyId === party.id} onChange={(event) => handleStatusChange(party, event.target.value as NonNullable<Party['status']>)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold outline-none disabled:cursor-wait disabled:opacity-60 ${statusClasses}`}>{partyStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
                        })()}
                      </TableCell>

                      <TableCell className="px-1 py-1 text-center text-sm text-gray-500 dark:text-gray-400">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 focus:outline-none"
                          onClick={() => handleLedger(party)}
                        >
                          Ledger
                        </button>
                      </TableCell>

                      <TableCell className="relative z-20 overflow-visible px-1 py-1 text-center text-sm">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4" />
                          </MenuButton>

                          <MenuItems anchor="bottom end" portal className="z-[100] w-40 origin-top-right rounded-lg border border-gray-100 bg-white p-1 shadow-xl focus:outline-none dark:border-white/[0.1] dark:bg-gray-900">
                            <div className="py-1">
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleView(party)}
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
                                    onClick={() => handleEdit(party)}
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
                                        setSelectedParty(party);
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

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><span>{totalItems.toLocaleString()} total</span><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {Math.max(totalPages, 1)}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
          </div>
      </section>

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
