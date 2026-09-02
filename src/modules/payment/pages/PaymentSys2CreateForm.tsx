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
import { ArrowLeftIcon, ListBulletIcon, PlusIcon } from "@heroicons/react/20/solid";

import { AppDispatch } from "../../../store/store";
import { OptionStringType, CurrencyOptions, selectStyles} from "../../types.ts";
import { Payment, paymentOptions } from "../features/paymentTypes.ts";

import { create } from "../features/paymentThunks";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllParties } from "../../party/features/partySelectors";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";


export default function PaymentSys2CreateForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [filterText, setFilterText] = useState('');

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));

    useEffect(() => {
        dispatch(fetchParty({ type: "all" }))
        dispatch(fetchAllInvoice());
        dispatch(fetchAllAccount());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchParty({ type: "all" }))
    }, [filterText]);

    const matchingParties = useSelector(selectAllParties);
    const invoices = useSelector(selectAllInvoice);
    const paymentAccounts = useSelector(selectAllAccount);

    const [formData, setFormData] = useState<Payment>({
        businessId: 0,
        invoiceId: null,
        categoryId: null,
        partyId: null,
        paymentType: '',
        paymentDate: "",
        note: "",
        amountPaid: 0,
        paymentMethod: "",
        bankId: 0,
        system: 2,
        currency: "",
        createdBy: 0,
    });

    useEffect(() => {
        if (user?.business?.id) {
          setFormData((prev) => ({
            ...prev,
            businessId: user?.business?.id,
            createdBy: user.id
          }));
        }
    }, [user]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        try {
            // Dispatch create action, including totalAmount
            
            await dispatch(create(formData));
            toast.success("Payment created successfully!");

            navigate(`/paymentSys2/list`);
        } catch (err) {
            toast.error("Failed to create payment.");
        }
    };

    const loadParties = async (inputValue: any) => {
        try {
            setFilterText(inputValue);

            const parties = matchingParties || [];

            return parties.map((p) => ({
                label: p.name,
                value: p.id,
                type: p.type,
                phoneNumber: p.phoneNumber,
            }));
        } catch (err) {
            console.error("Error fetching parties:", err);
            return [];
        }
    };
    

    return (
        <div className="mx-auto max-w-7xl">
        <PageMeta title="Payment Create" description="Form to create a new payment" />
        <PageBreadcrumb pageTitle="Payment Create" />

        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"><div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Payments</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create payment</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record payment references, party details, amounts, and account information.</p></div><div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>

          <button
            onClick={() => navigate('/paymentSys2/list')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"
          >
            <ListBulletIcon className="h-4 w-4" /> Payment list
          </button>
        </div></div></section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Payment details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill in the payment information below.</p></div>
            <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                

                {/* Invoice Type */}
                <div>
                    <Label>Select Invoice Ref (if have)</Label>
                    <Select
                        options={invoices.filter(i => i.vatInvoiceRefNo).map((i) => ({
                            label: `#${i.vatInvoiceRefNo}`,
                            value: i.id,
                            invoiceType: i.invoiceType,
                            categoryId: i.categoryId,
                            partyId: i.partyId,
                            partyName: i.party?.name
                        }))}
                        placeholder="Select invoice type"

                        onChange={(selectedOption) => {
                            setFormData(prev => ({
                                ...prev,
                                invoiceId: Number(selectedOption!.value),
                                invoiceType: selectedOption?.invoiceType,
                                categoryId: Number(selectedOption?.categoryId),
                                partyId: Number(selectedOption?.partyId)
                            }));
                            setFilterText(selectedOption?.partyName ?? "");
                        }}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Search Party */}
                <div>
                    <Label>Search & Select Party (if have)</Label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={matchingParties.map((p) => ({ label: p.name, value: p.id })) || null}
                        loadOptions={loadParties}
                        placeholder="Search and select party"
                        value={
                            matchingParties
                                .filter((p) => p.id === formData.partyId)
                                .map((p) => ({ label: p.name, value: p.id }))[0] || null
                        }
                        onChange={(selectedOption) =>{
                            if (!selectedOption) {
                                setFormData((prev) => ({ ...prev, partyId: null }));
                                return;
                            }

                                setFormData((prev) => ({
                                ...prev,
                                partyId: Number(selectedOption.value),
                            }));
                        }}
                        isClearable
                        isSearchable
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
                            console.log({ dates, currentDateString });
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
                        value={paymentOptions.find(option => option.value === formData.paymentType) || null}
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

                {/* Currency */}
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
                        required
                    />
                </div>

                {/* Paid Amount */}
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

                <div>
                    <Label>Select Payment Account</Label>
                    <Select
                        options={
                        paymentAccounts
                            .map((b) => ({
                                label: `${b.accountName}`,
                                value: b.id,
                            })) || []
                        }
                        placeholder="select Stock Accounts"
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

                {/* Note */}
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
            </div>

            <div className="flex justify-end">
                <Button type="submit" variant="success">
                <span className="inline-flex items-center gap-2"><PlusIcon className="h-4 w-4" /> Create payment</span>
                </Button>
            </div>
            </form>
        </section>
        </div>
    );
}
