import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowPathIcon, ChevronDownIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table/index.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";
import { useModal } from "../../../hooks/useModal.ts";
import { AppDispatch } from "../../../store/store.ts";
import { Invoice } from "../features/invoiceTypes.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllInvoiceByTypeSystem_2, selectInvoiceStatus } from "../features/invoiceSelectors.ts";
import { destroy, fetchAllInvoice } from "../features/invoiceThunks.ts";

export default function SellList() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser?.user?.id)));
  const invoices = useSelector(selectAllInvoiceByTypeSystem_2("sale"));
  const status = useSelector(selectInvoiceStatus);
  const { isOpen, openModal, closeModal } = useModal();
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState("1");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => { dispatch(fetchAllInvoice()); }, [dispatch]);

  const filteredData = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceQuery = invoiceSearch.trim().toLowerCase();
      const partyQuery = partySearch.trim().toLowerCase();
      const invoiceMatch = !invoiceQuery || [invoice.vatInvoiceRefNo, invoice.invoiceNo, invoice.invoiceType, ...((invoice.items ?? []).flatMap((item) => [item.name, item.unit, item.container?.containerNo]))]
        .some((value) => String(value ?? "").toLowerCase().includes(invoiceQuery));
      const partyMatch = !partyQuery || String(invoice.party?.name ?? "").toLowerCase().includes(partyQuery);
      const dateMatch = !dateFilter || invoice.date === dateFilter;
      return invoiceMatch && partyMatch && dateMatch;
    }).sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime() || Number(b.id ?? 0) - Number(a.id ?? 0));
  }, [dateFilter, invoices, invoiceSearch, partySearch]);

  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);
  const paginatedData = useMemo(() => filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [currentPage, filteredData, itemsPerPage]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [currentPage, totalPages]);
  useEffect(() => { setPageInput(String(currentPage)); }, [currentPage]);

  const can = (action: string) => user?.role?.permissions?.some((permission) => permission.action === action);
  const closeAndResetModal = () => { setSelectedInvoice(null); closeModal(); };
  const handleDelete = async () => {
    if (!selectedInvoice?.id) return;
    try {
      await dispatch(destroy(selectedInvoice.id)).unwrap();
      toast.success("Invoice deleted successfully");
      dispatch(fetchAllInvoice());
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to delete invoice");
    } finally { closeAndResetModal(); }
  };
  const refreshList = () => { setInvoiceSearch(""); setPartySearch(""); setDateFilter(""); setCurrentPage(1); setItemsPerPage(10); dispatch(fetchAllInvoice()); };
  const hasFilters = Boolean(invoiceSearch || partySearch || dateFilter);
  const applyPage = () => {
    const page = Math.min(Math.max(Number(pageInput) || 1, 1), totalPages);
    setCurrentPage(page);
    setPageInput(String(page));
  };

  return (
    <>
      <PageMeta title="Sale List" description="System 2 sale invoices" />
      <PageBreadcrumb pageTitle="Sale List" />

      <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Sales</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Sale invoices</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{filteredData.length.toLocaleString()} invoices found</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
            <button type="button" onClick={refreshList} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowPathIcon className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} /> Refresh</button>
            <button type="button" onClick={() => navigate("/invoice/sell/create")} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PlusIcon className="h-4 w-4" /> Create sale</button>
          </div>
        </div>
        <div className="border-b border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-white/[0.08] dark:bg-white/[0.02] sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Filters</h2><p className="text-xs text-gray-500 dark:text-gray-400">Invoice, customer, and date filters refine the System 2 sale records.</p></div>{hasFilters && <button type="button" onClick={() => { setInvoiceSearch(""); setPartySearch(""); setDateFilter(""); setCurrentPage(1); }} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Clear filters</button>}</div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Invoice reference<input value={invoiceSearch} onChange={(event) => { setInvoiceSearch(event.target.value); setCurrentPage(1); }} placeholder="VAT invoice number or item" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Customer<input value={partySearch} onChange={(event) => { setPartySearch(event.target.value); setCurrentPage(1); }} placeholder="Customer name" className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Date<input type="date" value={dateFilter} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1); }} className="mt-1 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-white/[0.12] dark:bg-gray-900 dark:text-gray-200" /></label>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-visible border-b border-gray-100 px-5 py-4 dark:border-white/[0.08]">
          <Table className="min-w-[1050px] border border-gray-200 text-center [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-2 [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-3 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
            <TableHeader className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400"><TableRow><TableCell isHeader>#</TableCell><TableCell isHeader>VAT invoice / Date</TableCell><TableCell isHeader>Party name</TableCell><TableCell isHeader>Items</TableCell><TableCell isHeader>Unit</TableCell><TableCell isHeader className="text-right">Total</TableCell><TableCell isHeader>Payment</TableCell><TableCell isHeader>Actions</TableCell></TableRow></TableHeader>
            <TableBody>
              {status === "loading" ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500">Loading sale invoices…</TableCell></TableRow>
                : paginatedData.length === 0 ? <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-gray-500">No sale invoices found.</TableCell></TableRow>
                : paginatedData.map((invoice, index) => {
                  const paid = Number(invoice.paymentInSum ?? 0); const total = Number(invoice.grandTotal ?? 0); const due = total - paid;
                  return <TableRow key={invoice.id} className="text-sm">
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell><div className="space-y-0.5"><p className="font-semibold text-emerald-600 dark:text-emerald-400">{invoice.vatInvoiceRefNo || "-"}</p><p className="text-xs text-gray-500 dark:text-gray-400">{invoice.date || "-"} · {invoice.invoiceType?.replaceAll("_", " ")}</p></div></TableCell>
                    <TableCell className="max-w-[180px] whitespace-normal font-medium text-gray-800 dark:text-gray-200">{invoice.party?.name && invoice.id ? <button type="button" onClick={() => window.open(`/invoice/${invoice.id}/view`, "_blank", "noopener,noreferrer")} className="text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400">{invoice.party.name}</button> : "-"}</TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal">{(invoice.items ?? []).map((item, itemIndex) => <p key={item.id ?? itemIndex} className="leading-5 text-gray-700 dark:text-gray-300">{item.name || "-"}{item.container?.containerNo ? <span className="ml-1 text-xs text-gray-400">({item.container.containerNo})</span> : null}</p>)}</TableCell>
                    <TableCell>{(invoice.items ?? []).map((item, itemIndex) => <p key={item.id ?? itemIndex} className="leading-5 text-gray-600 dark:text-gray-300">{item.quantity} {item.unit}</p>)}</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{total.toFixed(2)}</TableCell>
                    <TableCell><div className="space-y-1 text-xs">{paid > 0 && <p className="font-semibold text-emerald-600 dark:text-emerald-400">Paid: {paid.toFixed(2)}</p>}{due !== 0 && <p className={due > 0 ? "font-semibold text-amber-600 dark:text-amber-400" : "font-semibold text-sky-600 dark:text-sky-400"}>{due > 0 ? "Due" : "Over"}: {Math.abs(due).toFixed(2)}</p>}{paid <= 0 && due === 0 && <span className="text-gray-400">-</span>}</div></TableCell>
                    <TableCell className="overflow-visible"><Menu as="div" className="relative inline-block text-left"><MenuButton className="inline-flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600">Actions <ChevronDownIcon className="h-4 w-4" /></MenuButton><MenuItems className="absolute right-0 z-[60] mt-2 w-36 origin-top-right rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg focus:outline-none dark:border-white/[0.12] dark:bg-gray-900">
                      {(can("view_sale") || can("view_sale_2")) && <MenuItem>{({ active }) => <button type="button" onClick={() => navigate(`/invoice/${invoice.id}/view`)} className={`${active ? "bg-gray-50 dark:bg-white/[0.06]" : ""} flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}><EyeIcon className="h-4 w-4" /> View</button>}</MenuItem>}
                      {can("edit_sale_2") && <MenuItem>{({ active }) => <button type="button" onClick={() => navigate(`/invoice/${invoice.id}/edit`)} className={`${active ? "bg-gray-50 dark:bg-white/[0.06]" : ""} flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200`}><PencilIcon className="h-4 w-4" /> Edit</button>}</MenuItem>}
                      {can("delete_sale_2") && <MenuItem>{({ active }) => <button type="button" onClick={() => { setSelectedInvoice(invoice); openModal(); }} className={`${active ? "bg-red-50 dark:bg-red-500/10" : ""} flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400`}><TrashIcon className="h-4 w-4" /> Delete</button>}</MenuItem>}
                    </MenuItems></Menu></TableCell>
                  </TableRow>;
                })}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">Rows per page<select value={itemsPerPage} onChange={(event) => { setItemsPerPage(Number(event.target.value)); setCurrentPage(1); }} className="rounded-md border border-gray-200 bg-white px-2 py-1.5 dark:border-white/[0.12] dark:bg-gray-900">{[10, 25, 50, 100, 250, 500].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-300"><button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">First</button><button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Previous</button><span>Page</span><input value={pageInput} onChange={(event) => setPageInput(event.target.value)} onBlur={applyPage} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-center dark:border-white/[0.12] dark:bg-gray-900" /><span>of {totalPages}</span><button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= totalPages} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Next</button><button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-white/[0.12]">Last</button></div>
        </div>
      </section>
      <ConfirmationModal isOpen={isOpen} title="Delete this sale invoice?" width="400px" onCancel={closeAndResetModal} onConfirm={handleDelete} />
    </>
  );
}
