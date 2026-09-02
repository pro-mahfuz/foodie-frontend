import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";
import { useModal } from "../../../hooks/useModal.ts";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table/index.tsx";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { destroy } from "../features/stockThunks.ts";
import { fetchPage, StockColumnFilters } from "../features/stockAPI.ts";
import { Stock } from "../features/stockTypes.ts";

export default function StockList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const categories = useSelector(selectAllCategory);
  const { isOpen, openModal, closeModal } = useModal();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState("1");
  const [filterText, setFilterText] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<StockColumnFilters>({ date: "", movementType: "", item: "", container: "", account: "" });
  const [debouncedColumnFilters, setDebouncedColumnFilters] = useState<StockColumnFilters>(columnFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isMoneyStock = useMemo(
    () => categories.some((category) => ["currency", "gold"].includes(category.name.toLowerCase())),
    [categories],
  );

  useEffect(() => {
    if (!categories.length) dispatch(fetchAllCategory());
  }, [categories.length, dispatch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilter(filterText.trim());
      setDebouncedColumnFilters(columnFilters);
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filterText, columnFilters]);

  useEffect(() => setPageInput(String(currentPage)), [currentPage]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchPage({ page: currentPage, limit: itemsPerPage, filterText: debouncedFilter, filters: debouncedColumnFilters })
      .then((data) => {
        if (!active) return;
        setStocks(data.stocks);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        if (data.currentPage !== currentPage) setCurrentPage(data.currentPage);
      })
      .catch(() => {
        if (active) toast.error("Unable to load stock records");
      })
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [currentPage, itemsPerPage, debouncedFilter, debouncedColumnFilters, reloadKey]);

  const closeAndResetModal = () => {
    setSelectedStock(null);
    closeModal();
  };

  const handleDelete = async () => {
    if (!selectedStock?.id) return;
    try {
      await dispatch(destroy(selectedStock.id)).unwrap();
      toast.success("Stock deleted successfully");
      closeAndResetModal();
      setReloadKey((key) => key + 1);
    } catch {
      toast.error("Failed to delete stock");
    }
  };

  const canEdit = user?.role?.permissions?.some((permission) => permission.action === "edit_stock");
  const canDelete = user?.role?.permissions?.some((permission) => permission.action === "delete_stock");
  const columnCount = isMoneyStock ? 11 : 13;
  const hasColumnFilters = Object.values(columnFilters).some(Boolean);
  const updateColumnFilter = (name: keyof StockColumnFilters, value: string) => setColumnFilters((filters) => ({ ...filters, [name]: value }));
  const clearFilters = () => {
    setFilterText("");
    setColumnFilters({ date: "", movementType: "", item: "", container: "", account: "" });
  };
  const refreshTable = () => {
    clearFilters();
    setItemsPerPage(10);
    setCurrentPage(1);
    setReloadKey((key) => key + 1);
  };
  const applyPage = () => {
    const page = Math.min(Math.max(Number(pageInput) || 1, 1), Math.max(totalPages, 1));
    setCurrentPage(page);
    setPageInput(String(page));
  };
  return (
    <>
      <PageMeta title="Stock List" description="Searchable, paginated stock movements" />
      <PageBreadcrumb pageTitle="Stock List" />

      <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Inventory</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Stock movements</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{totalItems.toLocaleString()} records, newest first</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => navigate(-1)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]">Back</button>
            <button onClick={refreshTable} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]">
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={() => navigate("/stock/create")} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600">
              <PlusIcon className="h-4 w-4" /> Add stock
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Results update as you type</p>
            </div>
            {hasColumnFilters && <button onClick={clearFilters} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear Filter</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date<input aria-label="Filter by date" type="date" value={columnFilters.date} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => updateColumnFilter("date", event.target.value)} className="mt-1 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Reference / invoice<input aria-label="Filter by reference or invoice" value={filterText} onChange={(event) => setFilterText(event.target.value)} placeholder="Search reference" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Stock type<select aria-label="Filter by stock type" value={columnFilters.movementType} onChange={(event) => updateColumnFilter("movementType", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200"><option value="">All types</option><option value="stock_in">Stock in</option><option value="stock_out">Stock out</option><option value="damaged">Damaged</option></select></label>
            {!isMoneyStock && <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Container<input aria-label="Filter by container" value={columnFilters.container} onChange={(event) => updateColumnFilter("container", event.target.value)} placeholder="Container number" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>}
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">{isMoneyStock ? "Stock money" : "Item details"}<input aria-label="Filter by item" value={columnFilters.item} onChange={(event) => updateColumnFilter("item", event.target.value)} placeholder="Item name" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Account<input aria-label="Filter by account" value={columnFilters.account} onChange={(event) => updateColumnFilter("account", event.target.value)} placeholder="Warehouse or bank" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible border-y border-gray-100 px-5 py-4 dark:border-white/[0.08]">
          <Table className="min-w-[1180px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
            <TableHeader className="bg-gray-50 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
              <TableRow>
                {['#', 'Date', 'Reference', 'Type', 'Invoice', ...(isMoneyStock ? ['Stock money', 'Quantity'] : ['Container', 'Item details', 'Quantity', 'Unit']), 'Account', 'Created by', 'Updated by', ''].map((heading) => (
                  <TableCell key={heading || 'actions'} isHeader className="whitespace-nowrap px-3 py-3">{heading}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {isLoading ? (
                <TableRow><TableCell colSpan={columnCount} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading stock movements…</TableCell></TableRow>
              ) : stocks.length === 0 ? (
                <TableRow><TableCell colSpan={columnCount} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No stock records match your search.</TableCell></TableRow>
              ) : stocks.map((stock, index) => (
                <TableRow key={stock.id} className="relative z-0 transition-colors hover:z-10 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-400">{totalItems - ((currentPage - 1) * itemsPerPage + index)}</TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm font-medium text-gray-700 dark:text-gray-200">{stock.date}</TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm font-semibold text-brand-600 dark:text-brand-400">{stock.stockRefNo}</TableCell>
                  <TableCell className="px-1 py-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stock.movementType === 'stock_in' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : stock.movementType === 'damaged' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>{stock.movementType.replace('_', ' ')}</span></TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{stock.invoiceRefNo || '—'}</TableCell>
                  {!isMoneyStock && <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-600 dark:text-gray-300">{stock.container?.containerNo || '—'}</TableCell>}
                  <TableCell className="px-1 py-1 text-sm font-medium text-gray-700 dark:text-gray-200">{stock.item?.name || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{stock.quantity}</TableCell>
                  {!isMoneyStock && <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{stock.unit?.toUpperCase() || '—'}</TableCell>}
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-600 dark:text-gray-300">{stock.warehouse?.name || stock.bank?.accountName || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{stock.createdByUser || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 dark:text-gray-400">{stock.updatedByUser || '—'}</TableCell>
                  <TableCell className="relative z-20 overflow-visible px-1 py-1 text-center">
                    {(canEdit || canDelete) && <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none">Actions <ChevronDownIcon className="h-4 w-4" /></MenuButton>
                      <MenuItems anchor="bottom end" portal className="z-[100] w-36 origin-top-right rounded-lg border border-gray-100 bg-white p-1 shadow-xl focus:outline-none dark:border-white/[0.1] dark:bg-gray-900">
                        {canEdit && <MenuItem>{({ active }) => <button onClick={() => navigate(`/stock/${stock.id}/edit`)} className={`${active ? 'bg-gray-50 dark:bg-white/[0.06]' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}><PencilIcon className="h-4 w-4" /> Edit</button>}</MenuItem>}
                        {canDelete && <MenuItem>{({ active }) => <button onClick={() => { setSelectedStock(stock); openModal(); }} className={`${active ? 'bg-rose-50 dark:bg-rose-500/10' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600`}><TrashIcon className="h-4 w-4" /> Delete</button>}</MenuItem>}
                      </MenuItems>
                    </Menu>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input aria-label="Current page" value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {Math.max(totalPages, 1)}</span><button onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button onClick={() => setCurrentPage(Math.max(totalPages, 1))} disabled={currentPage >= Math.max(totalPages, 1)} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
        </div>
      </section>

      <ConfirmationModal isOpen={isOpen} title="Delete this stock record?" width="400px" onCancel={closeAndResetModal} onConfirm={handleDelete} />
    </>
  );
}
