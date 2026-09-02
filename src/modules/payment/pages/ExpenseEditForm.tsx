import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { ArrowLeftIcon, BanknotesIcon, ListBulletIcon, PencilIcon } from "@heroicons/react/20/solid";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import DatePicker from "../../../components/form/date-picker.tsx";
import { AppDispatch } from "../../../store/store";
import { CurrencyOptions, OptionStringType, selectStyles } from "../../types.ts";
import { Payment } from "../features/paymentTypes.ts";
import { fetchById, fetchAll as fetchPayment, update } from "../features/paymentThunks";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import * as invoiceAPI from "../../invoice/features/invoiceAPI.ts";
import * as containerAPI from "../../container/features/containerAPI.ts";

type InvoiceOption = { label: string; value: number; invoiceType?: string; categoryId?: number | null; partyId?: number | string | null };
type ContainerOption = { label: string; value: number };

export default function ExpenseEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const payment = useSelector(selectPaymentById(Number(id)));
  const paymentAccounts = useSelector(selectAllAccount);
  const expenseTypes = useSelector(selectAllStatusByType(Number(user?.business?.id), "expense"));
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Payment>({
    businessId: 0, invoiceId: null, categoryId: null, containerId: null, partyId: null,
    paymentType: "", paymentDate: "", note: "", amountPaid: 0, bankId: 0,
    paymentDetails: "", currency: "", createdBy: 0, updatedBy: 0, system: 1,
  });

  useEffect(() => {
    if (id) dispatch(fetchById(Number(id)));
    dispatch(fetchAllAccount());
    dispatch(fetchAllStatus());
  }, [dispatch, id]);

  useEffect(() => {
    if (!user?.business?.id || !payment) return;
    setFormData({
      id: payment.id,
      businessId: user.business.id,
      invoiceId: payment.invoiceId,
      categoryId: payment.categoryId,
      containerId: payment.containerId,
      partyId: payment.partyId,
      paymentType: payment.paymentType,
      paymentDate: payment.paymentDate,
      note: payment.note ?? "",
      amountPaid: payment.amountPaid,
      bankId: payment.bankId,
      paymentDetails: payment.paymentDetails ?? "",
      currency: payment.currency,
      createdBy: payment.createdBy,
      updatedBy: user.id,
      system: payment.system ?? 1,
    });
  }, [user, payment]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: name === "amountPaid" ? Number(value) : value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await dispatch(update(formData)).unwrap();
      toast.success("Expense updated successfully!");
      dispatch(fetchPayment());
      navigate("/expense/list");
    } catch {
      toast.error("Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceOptions = async (inputValue: string): Promise<InvoiceOption[]> => {
    const data = await invoiceAPI.fetchAllWithPagination({ page: 1, limit: 10, type: "all", filterText: inputValue });
    return data.invoices.map((invoice) => ({
      label: `#${invoice.invoiceNo}`,
      value: Number(invoice.id),
      invoiceType: invoice.invoiceType,
      categoryId: invoice.categoryId,
      partyId: invoice.partyId,
    }));
  };

  const loadContainerOptions = async (inputValue: string): Promise<ContainerOption[]> => {
    const data = await containerAPI.fetchOptions({ page: 1, limit: 10, filterText: inputValue });
    return data.containers.map((container: { id: number; containerNo: string }) => ({ label: container.containerNo, value: container.id }));
  };

  const invoiceValue: InvoiceOption | null = formData.invoiceId
    ? { label: payment?.invoice?.invoiceNo ? `#${payment.invoice.invoiceNo}` : payment?.invoiceRefNo || `Invoice #${formData.invoiceId}`, value: Number(formData.invoiceId) }
    : null;
  const containerValue: ContainerOption | null = formData.containerId
    ? { label: payment?.container?.containerNo || `Container #${formData.containerId}`, value: Number(formData.containerId) }
    : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Update Expense" description="Update an expense" />
      <PageBreadcrumb pageTitle="Update Expense" />

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><BanknotesIcon className="h-6 w-6" /></div>
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Update expense</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and update the selected expense record.</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
            <button type="button" onClick={() => navigate("/expense/list")} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> Expense list</button>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.08] sm:px-6"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Expense details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update the expense type, reference, settlement, and supporting note.</p></div>
        <div className="space-y-6 px-5 py-6 sm:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div><Label>Select Expense Type</Label><Select options={expenseTypes} placeholder="Select type" value={expenseTypes.find((option) => option.value === formData.paymentType) || null} onChange={(option) => setFormData((previous) => ({ ...previous, paymentType: option?.value ?? "", invoiceId: option?.value === "office_expense" ? null : previous.invoiceId, containerId: option?.value === "office_expense" ? null : previous.containerId }))} getOptionLabel={(option) => option.name} getOptionValue={(option) => option.value} styles={selectStyles} menuPortalTarget={document.body} menuPosition="fixed" classNamePrefix="react-select" isClearable required /></div>

            {formData.paymentType === "container_expense" && <div><Label>Select Invoice Ref (if have)</Label><AsyncSelect<InvoiceOption> cacheOptions defaultOptions loadOptions={loadInvoiceOptions} placeholder="Search invoice reference" value={invoiceValue} onChange={(option) => setFormData((previous) => ({ ...previous, invoiceId: option?.value ?? null, invoiceType: option?.invoiceType, categoryId: option?.categoryId ?? null, partyId: option?.partyId === null || option?.partyId === undefined ? null : Number(option.partyId) }))} styles={selectStyles} menuPortalTarget={document.body} menuPosition="fixed" classNamePrefix="react-select" isClearable /></div>}

            {formData.paymentType === "container_expense" && <div><Label>Search Container</Label><AsyncSelect<ContainerOption> cacheOptions defaultOptions loadOptions={loadContainerOptions} placeholder="Search container" value={containerValue} onChange={(option) => setFormData((previous) => ({ ...previous, containerId: option?.value ?? null }))} styles={selectStyles} menuPortalTarget={document.body} menuPosition="fixed" classNamePrefix="react-select" isClearable required /></div>}

            <div><DatePicker id="date-picker" label="Date" placeholder="Select a date" defaultDate={formData.paymentDate} onChange={(_, currentDateString) => setFormData((previous) => ({ ...previous, paymentDate: currentDateString }))} /></div>
            <div><Label>Select Currency</Label><Select<OptionStringType> options={CurrencyOptions} placeholder="Select currency" value={CurrencyOptions.find((option) => option.value === formData.currency) || null} onChange={(option) => setFormData((previous) => ({ ...previous, currency: option?.value ?? "" }))} styles={selectStyles} menuPortalTarget={document.body} menuPosition="fixed" classNamePrefix="react-select" required /></div>
            <div><Label>Amount</Label><Input type="number" name="amountPaid" placeholder="0" value={formData.amountPaid} onChange={handleChange} required /></div>
            <div><Label>Select Payment Account</Label><Select options={paymentAccounts.map((account) => ({ label: account.accountName, value: Number(account.id) }))} placeholder="Select payment account" value={paymentAccounts.find((account) => account.id === formData.bankId) ? { label: paymentAccounts.find((account) => account.id === formData.bankId)!.accountName, value: formData.bankId! } : null} onChange={(option) => setFormData((previous) => ({ ...previous, bankId: option?.value ?? null }))} isClearable styles={selectStyles} menuPortalTarget={document.body} menuPosition="fixed" classNamePrefix="react-select" required /></div>
            <div className="md:col-span-2 xl:col-span-2"><Label>Description / Note</Label><Input type="text" name="note" placeholder="Optional note" value={formData.note} onChange={handleChange} /></div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
          <button type="button" onClick={() => navigate("/expense/list")} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.04]">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"><PencilIcon className="h-4 w-4" /> {loading ? "Updating…" : "Update expense"}</button>
        </div>
      </form>
    </div>
  );
}
