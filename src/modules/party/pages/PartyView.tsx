import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ListBulletIcon,
  PencilIcon,
  PrinterIcon,
} from "@heroicons/react/20/solid";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAll as fetchLedgers } from "../../ledger/features/ledgerThunks.ts";
import { selectAllLedger, selectLedgerStatus } from "../../ledger/features/ledgerSelectors.ts";
import { fetchPartyById } from "../features/partyThunks.ts";
import { selectPartyById } from "../features/partySelectors.ts";

const details = (label: string, value?: string | number) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{value || "-"}</p>
  </div>
);

export default function PartyView() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const partyId = Number(id);
  const party = useSelector(selectPartyById(partyId));
  const ledgers = useSelector(selectAllLedger);
  const ledgerStatus = useSelector(selectLedgerStatus);

  useEffect(() => {
    if (partyId > 0) {
      dispatch(fetchPartyById(partyId));
      dispatch(fetchLedgers({ summary: true, partyId }));
    }
  }, [dispatch, partyId]);

  const partyStatus = party?.status ?? (party?.isActive ? "active" : "inactive");
  const partyTypeLabel = party?.type
    ? party.type.charAt(0).toUpperCase() + party.type.slice(1)
    : "Party";
  const statusClasses =
    partyStatus === "active"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : partyStatus === "blocked"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : partyStatus === "archived"
          ? "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300"
          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";

  const ledgerCurrencies = useMemo(() => {
    const summary = ledgers.reduce<Record<string, { debit: number; credit: number; entries: number }>>(
      (result, ledger) => {
        const currency = ledger.currency || ledger.invoice?.currency || "AED";
        if (!result[currency]) result[currency] = { debit: 0, credit: 0, entries: 0 };
        result[currency].debit += Number(ledger.debit) || 0;
        result[currency].credit += Number(ledger.credit) || 0;
        result[currency].entries += 1;
        return result;
      },
      {},
    );
    return Object.entries(summary).sort(([first], [second]) => first.localeCompare(second));
  }, [ledgers]);

  return (
    <>
      <PageMeta title="Party View" description="Party contact and business details" />
      

      <div className="mx-auto max-w-7xl">
        <div className="print:hidden">
        <PageBreadcrumb pageTitle="Party View" />
      </div>
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:hidden dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Contacts</p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{party?.name || "Party profile"}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review contact, business, and ledger details.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
              <button type="button" onClick={() => navigate(`/party/${party?.type ?? "all"}/list`)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> Party list</button>
              <button type="button" onClick={() => navigate(`/party/edit/${partyId}`)} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PencilIcon className="h-4 w-4" /> Edit</button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PrinterIcon className="h-4 w-4" /> Print</button>
            </div>
          </div>
        </section>

        {!party ? (
          <section id="print-section" className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-400">Loading party details…</section>
        ) : (
          <div id="print-section" className="space-y-6 print:space-y-4">
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:rounded-none print:shadow-none dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="bg-gradient-to-r from-brand-50 to-white px-5 py-5 dark:from-brand-500/10 dark:to-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white shadow-sm">{party.name.charAt(0).toUpperCase()}</div>
                    <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{party.name}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{partyTypeLabel} · ID #{party.id}</p></div>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses}`}>{partyStatus.charAt(0).toUpperCase() + partyStatus.slice(1)}</span>
                </div>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
                {details("Email", party.email)}
                {details("Phone", party.phoneNumber ? `${party.phoneCode || ""} ${party.phoneNumber}` : "")}
                {details("Company", party.company)}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print:rounded-none print:shadow-none dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
              <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold text-gray-900 dark:text-white">Ledger summary</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Current debit, credit, and closing balance by currency.</p></div>
                <button type="button" onClick={() => navigate(`/ledger/all/list/${party.id}`)} className="w-fit text-sm font-semibold text-brand-600 hover:text-brand-700 print:hidden dark:text-brand-400">View ledger</button>
              </div>
              {ledgerStatus === "loading" ? <p className="py-5 text-sm text-gray-500 dark:text-gray-400">Loading ledger summary…</p> : ledgerCurrencies.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {ledgerCurrencies.map(([currency, totals]) => (
                    <div key={currency} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.10] dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/[0.08]"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{currency}</p><p className="text-xs text-gray-500 dark:text-gray-400">{totals.entries} entries</p></div>
                      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-white/[0.08]">
                        <div className="p-4"><p className="text-xs text-gray-500 dark:text-gray-400">Debit</p><p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">{totals.debit.toFixed(2)}</p></div>
                        <div className="p-4 text-right"><p className="text-xs text-gray-500 dark:text-gray-400">Credit</p><p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{totals.credit.toFixed(2)}</p></div>
                      </div>
                      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]"><p className="text-xs text-gray-500 dark:text-gray-400">Closing balance</p><p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{(totals.credit - totals.debit).toFixed(2)} {currency}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="py-5 text-sm text-gray-500 dark:text-gray-400">No ledger entries found for this party.</p>}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
                <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Business details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Identification, tax, and opening balance information.</p></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {details("Trade license", party.tradeLicense)}
                  {details("TRN No", party.trnNo)}
                  {details("EID / Passport No", party.nationalId)}
                  {details("Opening balance", Number(party.openingBalance || 0).toFixed(2))}
                </div>
              </section>
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
                <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Address details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Registered contact location.</p></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">{details("Address", party.address)}</div>
                  {details("City", party.city)}
                  {details("Country", party.country)}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
