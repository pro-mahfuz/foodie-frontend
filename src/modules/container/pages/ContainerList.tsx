import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
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

import { Container, ContainerLifecycleStatus } from "../features/containerTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import {
  selectContainerStatus,
  selectAllContainersIncludingInactive,
} from "../features/containerSelectors.ts";
import { fetchAll, destroy, setStatus } from "../features/containerThunks.ts";

const containerStatuses: ContainerLifecycleStatus[] = ["Draft", "In Transit", "Arrived", "Customs Clearance", "Available", "Closed", "Inactive"];
const getContainerStatus = (container: Container): ContainerLifecycleStatus =>
  container.status ?? (container.isActive === true || Number(container.isActive) === 1 ? "Available" : "Inactive");

export default function ContainerList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const containers = useSelector(selectAllContainersIncludingInactive);
  const status = useSelector(selectContainerStatus);

  const [filterText, setFilterText] = useState<string>("");
  const [itemFilter, setItemFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | ContainerLifecycleStatus>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [pageInput, setPageInput] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingContainerId, setUpdatingContainerId] = useState<number | null>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  useEffect(() => {
    dispatch(fetchAll());
  }, [dispatch, refreshKey]);

  const filteredData = useMemo(() => {
  const search = filterText.toLowerCase();
  const itemSearch = itemFilter.toLowerCase();

  return containers.filter((c) => {
    const matchesSearch = !search || [c.containerNo, c.oceanVesselName, c.blNo, c.soNo, c.agentDetails, c.sealNo, c.portOfLoading, c.portOfDischarge]
      .some((value) => String(value ?? '').toLowerCase().includes(search));
    const matchesStatus = statusFilter === 'all' || getContainerStatus(c) === statusFilter;
    const matchesItem = !itemSearch || (c.stocks ?? []).some((stock) => stock.item?.name?.toLowerCase().includes(itemSearch));
    return matchesSearch && matchesStatus && matchesItem;
  });
}, [containers, filterText, itemFilter, statusFilter]);


  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // const handleView = (container: Container) => {
  //   navigate(`/container/view/${container.id}`);
  // };

  const handleEdit = (container: Container) => {
    navigate(`/container/${container.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedContainer) return;

    try {
      // You can implement a deleteSupplier thunk and use it here:
      await dispatch(destroy(selectedContainer.id!)).unwrap();
      toast.success("Invoice deleted successfully");
      closeAndResetModal();
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error("Failed to delete invoice");
    }
  };

  const closeAndResetModal = () => {
    setSelectedContainer(null);
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
    setItemFilter('');
    setStatusFilter('all');
    setCurrentPage(1);
    setItemsPerPage(10);
    setRefreshKey((key) => key + 1);
  };

  const handleStatusChange = async (container: Container, status: ContainerLifecycleStatus) => {
    if (!container.id || getContainerStatus(container) === status) return;
    try {
      setUpdatingContainerId(container.id);
      await dispatch(setStatus({ id: container.id, status })).unwrap();
      toast.success(`Container status changed to ${status}`);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update container status');
    } finally {
      setUpdatingContainerId(null);
    }
  };
  const applyPage = () => {
    const page = Math.min(Math.max(Number(pageInput) || 1, 1), totalPages);
    setCurrentPage(page);
    setPageInput(String(page));
  };
  return (
    <>
      <PageMeta
        title="Container List Table"
        description="Container Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Container List" />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Logistics</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Containers</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{filteredData.length.toLocaleString()} containers found</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowPathIcon className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} /> Refresh</button><button onClick={() => navigate('/container/create')} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PlusIcon className="h-4 w-4" /> Add container</button></div>
          </div>

          <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Search by container, shipment information, item, or status.</p></div>{(filterText || itemFilter || statusFilter !== 'all') && <button onClick={() => { setFilterText(''); setItemFilter(''); setStatusFilter('all'); setCurrentPage(1); }} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filters</button>}</div>
            <div className="grid max-w-4xl gap-3 sm:grid-cols-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Search containers<input value={filterText} onChange={(event) => { setFilterText(event.target.value); setCurrentPage(1); }} placeholder="Container no., B.L. no., vessel, agent..." className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label><label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Items<input value={itemFilter} onChange={(event) => { setItemFilter(event.target.value); setCurrentPage(1); }} placeholder="Filter by item name" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label><label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as 'all' | ContainerLifecycleStatus); setCurrentPage(1); }} className="mt-1 h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200"><option value="all">All statuses</option>{containerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
          </div>

          <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
            <Table className="min-w-[1200px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_td]:px-1 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-3 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Date</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Container</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Items</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Shipment</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Vessel / Voyage</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Agent</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Status</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((container, index) => (
                    <TableRow key={container.id} className="relative z-0 transition-colors hover:z-10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{container.date || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-sm"><div className="font-medium text-gray-800 dark:text-gray-100">{container.containerNo || '-'}</div><div className="mt-0.5 text-xs text-gray-400">Seal: {container.sealNo || '-'}</div></TableCell>
                      <TableCell className="max-w-56 whitespace-normal break-words px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Array.from(new Set((container.stocks ?? []).map((stock) => stock.item?.name).filter(Boolean))).join(', ') || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"><div>B.L.: {container.blNo || '-'}</div><div className="mt-0.5 text-xs text-gray-400">S.O.: {container.soNo || '-'}</div></TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"><div>{container.oceanVesselName || '-'}</div><div className="mt-0.5 text-xs text-gray-400">Voyage: {container.voyageNo || '-'}</div></TableCell>
                      <TableCell className="max-w-48 whitespace-normal break-words px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{container.agentDetails || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm"><select value={getContainerStatus(container)} disabled={updatingContainerId === container.id} onChange={(event) => handleStatusChange(container, event.target.value as ContainerLifecycleStatus)} className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none ${getContainerStatus(container) === 'Inactive' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'} disabled:opacity-50`}>{containerStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></TableCell>
                      <TableCell className="relative z-20 overflow-visible px-1 py-1 text-center text-sm">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                            Actions
                            <ChevronDownIcon className="h-4 w-4 text-white" />
                          </MenuButton>

                          <MenuItems anchor="bottom end" portal className="z-[100] w-40 origin-top-right rounded-lg border border-gray-100 bg-white p-1 shadow-xl focus:outline-none dark:border-white/[0.1] dark:bg-gray-900">
                            <div className="py-1">
                              {/* <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleView(container)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                    View
                                  </button>
                                )}
                              </MenuItem> */}
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => navigate(`/report/stock?containerId=${container.id}`)}
                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                  >
                                    <ChartBarIcon className="h-4 w-4" />
                                    Report
                                  </button>
                                )}
                              </MenuItem>
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEdit(container)}
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
                                      setSelectedContainer(container);
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

          <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label><div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><span>{filteredData.length.toLocaleString()} total</span><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {Math.max(totalPages, 1)}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div></div>
      </section>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this container?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
