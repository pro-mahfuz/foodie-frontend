import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import Select from "react-select";
import AsyncSelect from "react-select/async";

import { AppDispatch } from "../../../store/store";
import { OptionStringType, CurrencyOptions } from "../../types.ts";
import { Payment, paymentOptions } from "../features/paymentTypes.ts";

import { update } from "../features/paymentThunks";
import { fetchAll as fetchPayment } from "../../payment/features/paymentThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { ArrowLeftIcon, BanknotesIcon, EyeIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import * as partyAPI from "../../party/features/partyAPI.ts";
import * as invoiceAPI from "../../invoice/features/invoiceAPI.ts";

type InvoiceOption = { label: string; value: number; invoiceType?: string; categoryId?: number | null; partyId?: number | string | null; partyName?: string };

export default function PaymentEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState<{ label: string; value: number } | null>(null);

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const payment = useSelector(selectPaymentById(Number(id)));
  const paymentAccounts = useSelector(selectAllAccount);

  // Initial data load
  useEffect(() => {
    dispatch(fetchPayment());
    dispatch(fetchAllAccount());
  }, [dispatch]);

  const [formData, setFormData] = useState<Payment>({
    businessId: 0,
    invoiceId: null,
    categoryId: null,
    partyId: null,
    paymentType: "",
    paymentDate: "",
    note: "",
    amountPaid: 0,
    bankId: 0,
    paymentDetails: "",
    currency: "",
    system: 1,
    createdBy: 0,
    updatedBy: 0,
  });

  // Populate form data when payment is loaded
  useEffect(() => {
    if (user?.business?.id && payment) {
      setFormData({
        id: payment.id,
        businessId: user?.business?.id,
        invoiceId: payment.invoiceId,
        categoryId: payment.categoryId,
        partyId: payment.partyId,
        paymentType: payment.paymentType,
        paymentDate: payment.paymentDate,
        note: payment.note,
        amountPaid: payment.amountPaid,
        bankId: payment.bankId,
        paymentDetails: payment.paymentDetails,
        system: 1,
        currency: payment.currency,
        createdBy: payment.createdBy,
        updatedBy: user.id,
      });

      if (payment.party) {
        setSelectedParty({ label: payment.party.name, value: Number(payment.partyId) });
      }
    }
  }, [user, payment]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(update(formData));
      toast.success("Payment updated successfully!");
      dispatch(fetchPayment());
      navigate(`/payment/list`);
    } catch {
      toast.error("Failed to update payment.");
    } finally {
      setLoading(false);
    }
  };

  // Styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? "#72a4f5ff" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #8eb8fcff" : "none",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.375rem",
      minHeight: "38px",
      fontSize: "0.875rem",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 20,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e0f2fe" : "white",
      color: "#1f2937",
      fontSize: "0.875rem",
      padding: "0.5rem 0.75rem",
    }),
  };

  // Load party options
  // const loadParties = async (inputValue: string) => {
  //   console.log("inputValue- ", inputValue);
  //   if (inputValue.length > 1) {
  //     await dispatch(fetchPartyPaginated({ page: 1, limit: 10, type: "all", filterText: inputValue }));
  //   }
  //   //const parties = useSelector(selectAllParties);
  //   console.log("parties- ", matchingParties.length);
  //   return matchingParties.map((p) => ({
  //     label: p.name,
  //     value: Number(p.id),
  //     type: p.type,
  //     phoneNumber: p.phoneNumber,
  //   }));
  // };

  const handleView = (payment: Payment) => {
    navigate(`/payment/${payment.id}/view`);
  };
  
  const handleList = () => {
    navigate(`/payment/list`);
  };

  const loadInvoices = async (inputValue: string) => {
    const data = await invoiceAPI.fetchAllWithPagination({ page: 1, limit: 10, type: 'all', filterText: inputValue });
    return data.invoices.map((invoice): InvoiceOption => ({ label: `#${invoice.invoiceNo}`, value: Number(invoice.id), invoiceType: invoice.invoiceType, categoryId: invoice.categoryId, partyId: invoice.partyId, partyName: invoice.party?.name }));
  };
  const loadParties = async (inputValue: string) => {
    const data = await partyAPI.fetchPartyPaginated({ page: 1, limit: 10, type: 'all', filterText: inputValue });
    return data.parties.map((party) => ({ label: party.name, value: Number(party.id) }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Payment Update" description="Form to create a payment" />
      <PageBreadcrumb pageTitle="Payment Update" />

      <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]"><div className="flex items-start gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><BanknotesIcon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Edit payment #{id}</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update the payment reference, party, settlement, and account details.</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button type="button" onClick={handleList} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> Payment list</button><button type="button" onClick={() => { if (payment) handleView(payment); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><EyeIcon className="h-4 w-4" /> View</button></div></div>
        <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
          <div><div className="mb-4"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Payment details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update the linked invoice or party, then edit the payment details.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Invoice Select */}
            <div>
              <Label>Select Invoice Ref (if have)</Label>
              <AsyncSelect<InvoiceOption>
                cacheOptions
                defaultOptions
                loadOptions={loadInvoices}
                placeholder="Select invoice"
                value={
                  formData.invoiceId ? { label: `#${payment?.invoice?.invoiceNo ?? formData.invoiceId}`, value: formData.invoiceId } : null
                }
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    invoiceId: Number(selectedOption?.value),
                    invoiceType: selectedOption?.invoiceType,
                    categoryId: Number(selectedOption?.categoryId),
                    partyId: Number(selectedOption?.partyId),
                  }));

                  // set selected party locally (no re-fetch)
                  if (selectedOption?.partyName && selectedOption?.partyId) {
                    setSelectedParty({
                      label: selectedOption.partyName,
                      value: Number(selectedOption.partyId),
                    });
                  }
                }}
                styles={selectStyles}
                isClearable
                classNamePrefix="react-select"
              />
            </div>

            <div>
              <Label>Select Party</Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadParties}
                placeholder="Search and select party"
                value={selectedParty}
                onChange={(selectedOption) => {
                  // Update selected party
                  setSelectedParty(selectedOption);

                  // Update form data: set partyId and reset invoiceId
                  setFormData((prev) => ({
                    ...prev,
                    partyId: selectedOption?.value ?? 0,
                  }));
                }}
                isClearable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {/* Date */}
            <div>
              <DatePicker
                id="date-picker"
                label="Date"
                placeholder="Select a date"
                defaultDate={formData.paymentDate}
                onChange={(dates, currentDateString) => {
                  console.log(dates);
                  setFormData((prev) => ({
                    ...prev!,
                    paymentDate: currentDateString,
                  }));
                }}
              />
            </div>

            {/* Payment Type */}
            <div>
              <Label>Select Payment Type</Label>
              <Select<OptionStringType>
                options={paymentOptions}
                placeholder="Select payment type"
                value={paymentOptions.find((o) => o.value === formData.paymentType) || null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setFormData((prev) => ({
                      ...prev,
                      paymentType: selectedOption.value,
                    }));
                  }
                }}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            <div className="col-span-full border-t border-gray-100 pt-5 dark:border-white/[0.08]"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Settlement details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Edit the amount, currency, payment account, and supporting details.</p></div>

            <div>
              <Label>Select Currency</Label>
              <Select<OptionStringType>
                options={CurrencyOptions}
                placeholder="Select Currency"
                value={
                  formData
                    ? CurrencyOptions.find((option) => option.value === formData.currency)
                    : null
                }
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev!,
                    currency: selectedOption!.value,
                  }));
                }}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {/* Amount */}
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                name="amountPaid"
                placeholder="Enter amount"
                value={formData.amountPaid}
                onChange={handleChange}
                step={0.01}
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <Label>Note</Label>
              <Input
                type="text"
                name="note"
                placeholder="Optional note"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            {/* Payment Account */}
            {
              formData.paymentType !== "payable" && formData.paymentType !== "receivable" && (
                <div>
                  <Label>Select Payment Account</Label>
                  <Select
                    options={
                      paymentAccounts.map((b) => ({
                        label: `${b.accountName}`,
                        value: b.id,
                      })) || []
                    }
                    placeholder="Select account"
                    value={
                      paymentAccounts
                        ?.filter((b) => b.id === formData.bankId)
                        .map((b) => ({ label: b.accountName, value: b.id }))[0] || null
                    }
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        bankId: selectedOption?.value ?? 0,
                      }))
                    }
                    isClearable
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
              )
            }

            {/* Payment Details */}
            <div className="md:col-span-2">
              <Label>Payment Details (if have)</Label>
              <Input
                type="text"
                name="paymentDetails"
                placeholder="Optional payment details"
                value={formData.paymentDetails}
                onChange={handleChange}
              />
            </div>
          </div></div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]"><p className="text-sm text-gray-500 dark:text-gray-400">Review all payment values before saving your changes.</p>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
