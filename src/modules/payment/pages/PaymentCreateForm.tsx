import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { OptionStringType, CurrencyOptions, selectStyles } from "../../types.ts";
import { Payment, paymentOptions } from "../features/paymentTypes.ts";

import { create } from "../features/paymentThunks";
import { fetchAll as fetchPayment } from "../../payment/features/paymentThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { ArrowLeftIcon, BanknotesIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import * as partyAPI from "../../party/features/partyAPI.ts";
import * as invoiceAPI from "../../invoice/features/invoiceAPI.ts";

export default function PaymentCreateForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  

  const [loading, setLoading] = useState(false);
  const [selectedParty, setSelectedParty] = useState<{ label: string; value: number } | null>(null);

  const [formData, setFormData] = useState<Payment>({
    businessId: 0,
    invoiceId: null,
    categoryId: null,
    partyId: null,
    paymentType: "",
    paymentDate: "",
    note: "",
    amountPaid: 0,
    paymentMethod: "",
    bankId: null,
    system: 1,
    currency: "",
    createdBy: 0,
  });

  // Load required data once
  useEffect(() => {
    dispatch(fetchPayment());
    dispatch(fetchAllAccount());
  }, [dispatch]);

  // Update form with user info
  useEffect(() => {
    if (user?.business?.id) {
      setFormData((prev) => ({
        ...prev,
        businessId: user?.business?.id,
        createdBy: user.id,
      }));
    }
  }, [user]);

  const paymentAccounts = useSelector(selectAllAccount);

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
      await dispatch(create(formData));
      toast.success("Payment created successfully!");
      navigate(`/payment/list`);
    } catch {
      toast.error("Failed to create payment.");
    } finally {
      setLoading(false);
    }
  };

  // Async party loader (only fetch when searching)
  // const loadParties = async (inputValue: string) => {
  //   console.log("inputValue- ", inputValue);
  //   await dispatch(fetchPartyPaginated({ page: 1, limit: 10, type: "all", filterText: inputValue }));
  //   console.log(matchingParties.length);
  //   //const parties = useSelector(selectAllParties); // safe since Redux updated
  //   return matchingParties.map((p) => ({
  //     label: p.name,
  //     value: Number(p.id),
  //   }));
  // };

  const loadInvoices = async (inputValue: string) => {
    const data = await invoiceAPI.fetchAllWithPagination({ page: 1, limit: 10, type: "all", filterText: inputValue });
    return data.invoices.map((i) => ({
        label: i.invoiceNo,
        value: i.id,
        invoiceType: i.invoiceType,
        categoryId: i.categoryId,
        partyId: i.partyId,
        partyName: i.party?.name,
    }));
  };

  const loadParties = async (inputValue: string) => {
    const data = await partyAPI.fetchPartyPaginated({ page: 1, limit: 10, type: "all", filterText: inputValue });
    return data.parties.map((party) => ({ label: party.name, value: Number(party.id) }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Payment Create" description="Form to create a new payment" />
      <PageBreadcrumb pageTitle="Payment Create" />

      <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
          <div className="flex items-start gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><BanknotesIcon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create payment</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record a party payment, invoice reference, and settlement account.</p></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button type="button" onClick={() => navigate('/payment/list')} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> Payment list</button></div>
        </div>
        <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
          <div><div className="mb-4"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Payment details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Link an invoice or select a party, then set the payment date and type.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Invoice */}
            <div>
              <Label>Select Invoice Ref (if have)</Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadInvoices}
                placeholder="Search invoice"
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    invoiceId: Number(selectedOption?.value),
                    invoiceType: selectedOption?.invoiceType,
                    categoryId: Number(selectedOption?.categoryId),
                    partyId: Number(selectedOption?.partyId),
                  }));

                  // Update selected party without triggering re-fetch
                  if (selectedOption?.partyId && selectedOption?.partyName) {
                    setSelectedParty({
                      label: selectedOption.partyName,
                      value: Number(selectedOption.partyId),
                    });
                  }
                }}
                isClearable
                isSearchable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            {/* Party */}
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
                placeholder="Select Payment type"
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
                required
              />
            </div>

            <div className="col-span-full border-t border-gray-100 pt-5 dark:border-white/[0.08]"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Settlement details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter the paid amount, currency, account, and any supporting information.</p></div>

            <div>
              <Label>Select Currency</Label>
              <Select<OptionStringType>
                options={CurrencyOptions}
                placeholder="Select Currency"
                value={
                  formData
                    ? CurrencyOptions.find((o) => o.value === formData.currency)
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
                required
              />
            </div>

            {/* Amount */}
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                name="amountPaid"
                placeholder="0"
                onChange={handleChange}
                step={0.01}
                required
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

            {/* Account */}
            {
              formData.paymentType !== "payable" && formData.paymentType !== "receivable" && (
                <div>
                  <Label>Select Payment Account</Label>
                  <Select
                    options={
                      paymentAccounts.map((b) => ({
                        label: b.accountName,
                        value: b.id,
                      })) || []
                    }
                    placeholder="Select Payment Account"
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
                    required
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

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]"><p className="text-sm text-gray-500 dark:text-gray-400">Review the party, amount, and payment account before saving.</p>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Saving..." : "Create payment"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
