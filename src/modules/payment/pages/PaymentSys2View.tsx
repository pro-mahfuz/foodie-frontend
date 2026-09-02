import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftIcon, BanknotesIcon, ListBulletIcon, PencilIcon, PrinterIcon } from "@heroicons/react/20/solid";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AppDispatch } from "../../../store/store";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { fetchAll as fetchPayment } from "../../payment/features/paymentThunks.ts";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";

export default function PaymentSys2View() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    dispatch(fetchPayment());
  }, [dispatch]);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const payment = useSelector(selectPaymentById(Number(id)));

  function numberToWords(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const convertTens = (value: number) => value < 20 ? ones[value] : `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`;
    const convertHundreds = (value: number) => value > 99 ? `${ones[Math.floor(value / 100)]} Hundred ${convertTens(value % 100)}` : convertTens(value);
    const convert = (value: number) => {
      if (value === 0) return "Zero";
      const thousands = Math.floor(value / 1000);
      return `${thousands ? `${convertHundreds(thousands)} Thousand ` : ""}${convertHundreds(value % 1000)}`.trim();
    };
    const [dirhams, fils] = amount.toString().split(".").map(Number);
    return `${dirhams > 0 ? convert(dirhams) : ""}${fils > 0 ? `${dirhams > 0 ? " and " : ""}${convert(fils)}` : ""}`.trim() || "Zero";
  }

  const voucherTitle = payment?.paymentType === "payment_in" ? "Received Voucher"
    : payment?.paymentType === "payment_out" ? "Payment Voucher"
    : payment?.paymentType === "advance_received" ? "Advance Received Voucher"
    : payment?.paymentType === "advance_payment" ? "Advance Payment Voucher"
    : payment?.paymentType === "advance_payment_deduct" ? "Advance Payment Deduct Voucher"
    : payment?.paymentType === "advance_received_deduct" ? "Advance Received Deduct Voucher"
    : ["discount_purchase", "discount_sale"].includes(payment?.paymentType ?? "") ? "Discount Voucher"
    : payment?.paymentType === "premium_collection" ? "Premium Collection Voucher"
    : payment?.paymentType === "deposit" ? "Deposit Voucher"
    : payment?.paymentType === "withdraw" ? "Withdraw Voucher"
    : payment?.paymentType ? `${payment.paymentType.replaceAll("_", " ")} Voucher` : "Payment Voucher";

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Payment View" description="Payment View" />
      <PageBreadcrumb pageTitle="Payment View" />

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:hidden dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><BanknotesIcon className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p>
              <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Payment voucher</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review payment #{payment?.paymentRefNo ?? id} and its settlement details.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
            <button onClick={() => navigate("/paymentSys2/list")} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> Payment list</button>
            <button onClick={() => navigate(`/paymentSys2/${id}/edit`)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><PencilIcon className="h-4 w-4" /> Edit</button>
            {user?.role?.permissions?.some(permission => permission.action === "print_invoice" || permission.action === "print_purchase_invoice" || permission.action === "print_sale_invoice") && <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PrinterIcon className="h-4 w-4" /> Print</button>}
          </div>
        </div>
      </section>

      <section id="print-section" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print:border-0 print:p-0 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
        {!payment ? <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">Loading payment details…</div> : <div className="space-y-6">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              {user?.business?.businessLogo && <img src={user.business.businessLogo instanceof File ? URL.createObjectURL(user.business.businessLogo) : `${API_URL}${user.business.businessLogo}`} alt="Business logo" className="h-12 w-20 object-contain" />}
              <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.business?.businessName || "Business"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user?.business?.address || "Business address"}</p>{user?.business?.trnNo && <p className="text-sm text-gray-500 dark:text-gray-400">TRN: {user.business.trnNo}</p>}</div>
            </div>
            <div className="text-left sm:text-right"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">{voucherTitle}</p><p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{payment.paymentRefNo || "-"}</p><p className="text-sm text-gray-500 dark:text-gray-400">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "-"}</p></div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Party details</p><h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{payment.party?.name || "-"}</h3><div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">{payment.party?.phoneNumber && <p>{payment.party.phoneCode} {payment.party.phoneNumber}</p>}{payment.party?.address && <p>{payment.party.address}</p>}{payment.party?.trnNo && <p>TRN: {payment.party.trnNo}</p>}</div></div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Settlement details</p><dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><dt className="text-gray-500 dark:text-gray-400">Invoice</dt><dd className="text-right font-medium text-gray-800 dark:text-gray-200">{payment.invoiceRefNo || "-"}</dd><dt className="text-gray-500 dark:text-gray-400">Account</dt><dd className="text-right font-medium text-gray-800 dark:text-gray-200">{payment.bank?.accountName || "-"}</dd><dt className="text-gray-500 dark:text-gray-400">Currency</dt><dd className="text-right font-medium text-gray-800 dark:text-gray-200">{payment.currency || "-"}</dd><dt className="text-gray-500 dark:text-gray-400">Amount</dt><dd className="text-right font-semibold text-brand-600 dark:text-brand-400">{Number(payment.amountPaid || 0).toFixed(2)}</dd></dl></div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[720px] border border-gray-200 [&_td]:border [&_td]:border-gray-200 [&_th]:border [&_th]:border-gray-200 dark:border-white/[0.12] dark:[&_td]:border-white/[0.12] dark:[&_th]:border-white/[0.12]">
              <TableHeader className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400"><TableRow><TableCell isHeader className="px-3 py-3 text-center">Reference</TableCell><TableCell isHeader className="px-3 py-3">Description</TableCell><TableCell isHeader className="px-3 py-3 text-center">Account</TableCell><TableCell isHeader className="px-3 py-3 text-center">Currency</TableCell><TableCell isHeader className="px-3 py-3 text-right">Amount</TableCell></TableRow></TableHeader>
              <TableBody><TableRow><TableCell className="px-3 py-3 text-center text-sm font-medium text-gray-800 dark:text-gray-200">{payment.paymentRefNo || "-"}</TableCell><TableCell className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{payment.note?.trim() || (payment.invoiceRefNo ? `For invoice: ${payment.invoiceRefNo}` : "-")}</TableCell><TableCell className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{payment.bank?.accountName || "-"}</TableCell><TableCell className="px-3 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{payment.currency || "-"}</TableCell><TableCell className="px-3 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{Number(payment.amountPaid || 0).toFixed(2)}</TableCell></TableRow></TableBody>
            </Table>
          </div>

          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-white/[0.12] dark:text-gray-300"><span className="font-semibold text-gray-800 dark:text-white">In words: </span>{numberToWords(Number(payment.amountPaid || 0))} ({payment.currency || "-"}) only</div>
          <div className="grid grid-cols-2 gap-8 pt-10 text-center text-sm text-gray-500 dark:text-gray-400"><div><div className="mx-auto mb-2 w-40 border-t border-gray-400" />Receiver's signature</div><div><div className="mx-auto mb-2 w-40 border-t border-gray-400" />Authorized signature</div></div>
        </div>}
      </section>
    </div>
  );
}
