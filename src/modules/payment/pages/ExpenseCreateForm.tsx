import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import DatePicker from "../../../components/form/date-picker.tsx";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { ArrowLeftIcon, BanknotesIcon, ListBulletIcon, PlusIcon } from "@heroicons/react/20/solid";

import { AppDispatch } from "../../../store/store";
import { OptionStringType, selectStyles, CurrencyOptions } from "../../types.ts";
import { Payment } from "../features/paymentTypes.ts";

import { create } from "../features/paymentThunks";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import * as invoiceAPI from "../../invoice/features/invoiceAPI.ts";
import * as containerAPI from "../../container/features/containerAPI.ts";

type InvoiceOption = { label: string; value: number; invoiceType?: string; categoryId?: number | null; partyId?: number | string | null };
type ContainerOption = { label: string; value: number };




export default function ExpenseCreateForm() {

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    useEffect(() => {
        dispatch(fetchParty({ type: "all" }))
        dispatch(fetchAllAccount());
        dispatch(fetchAllStatus());
    }, [dispatch]);

    const paymentAccounts = useSelector(selectAllAccount);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), 'expense'));

    const [formData, setFormData] = useState<Payment>({
        businessId: 0,
        invoiceId: null,
        categoryId: null,
        containerId: null,
        partyId: null,
        paymentType: '',
        paymentDate: "",
        note: "",
        amountPaid: 0,
        paymentMethod: "",
        bankId: 0,
        currency: "",
        createdBy: 0,
        system: 1
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
            toast.success("Expense created successfully!");

            navigate(`/expense/list`);
        } catch (err) {
            toast.error("Failed to create expense.");
        }
    };

    const loadInvoiceOptions = async (inputValue: string) => {
        const data = await invoiceAPI.fetchAllWithPagination({ page: 1, limit: 10, type: "all", filterText: inputValue });
        return data.invoices.map((invoice): InvoiceOption => ({
            label: `#${invoice.invoiceNo}`,
            value: Number(invoice.id),
            invoiceType: invoice.invoiceType,
            categoryId: invoice.categoryId,
            partyId: invoice.partyId,
        }));
    };

    const loadContainerOptions = async (inputValue: string) => {
        const data = await containerAPI.fetchOptions({ page: 1, limit: 10, filterText: inputValue });
        return data.containers.map((container: { id: number; containerNo: string }) => ({
            label: container.containerNo,
            value: container.id,
        }));
    };

    

    return (
        <div className="mx-auto max-w-7xl">
            <PageMeta title="Create Expense" description="Create a new expense" />
            <PageBreadcrumb pageTitle="Create Expense" />

            <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            <BanknotesIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Finance</p>
                            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create expense</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record an expense and link it to a container when applicable.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300">
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </button>
                        <button type="button" onClick={() => navigate("/expense/list")} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300">
                            <ListBulletIcon className="h-4 w-4" /> Expense list
                        </button>
                    </div>
                </div>
            </section>

            <form onSubmit={handleSubmit} className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.08] sm:px-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Expense details</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fields marked by their selection requirements are needed to save the expense.</p>
                </div>
                <div className="space-y-6 px-5 py-6 sm:px-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {/* Payment Type */}
                <div>
                    <Label>Select Expense Type</Label>
                    <Select
                        options={InvoiceTypeOptions}
                        placeholder="Select type"
                        value={InvoiceTypeOptions.find(option => option.value === formData.paymentType) || null}
                        onChange={(selectedOption) => {
                        if (selectedOption) {
                            setFormData((prev) => ({
                                ...prev,
                                paymentType: selectedOption.value,
                            }));
                        }
                        }}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.value}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                        isClearable
                        required
                    />
                </div>

                {/* Invoice Type */}
                { formData.paymentType === "container_expense" && (
                    <div>
                        <Label>Select Invoice Ref</Label>
                        <AsyncSelect<InvoiceOption>
                            cacheOptions
                            defaultOptions
                            loadOptions={loadInvoiceOptions}
                            placeholder="Search invoice reference"
                            onChange={(selectedOption) => {
                                setFormData(prev => ({
                                    ...prev,
                                    invoiceId: selectedOption ? Number(selectedOption.value) : null,
                                    invoiceType: selectedOption?.invoiceType,
                                    categoryId: selectedOption?.categoryId ? Number(selectedOption.categoryId) : null,
                                    partyId: selectedOption?.partyId ? Number(selectedOption.partyId) : null
                                    
                                }));
                            }}
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            isClearable
                        />
                    </div>
                ) }

                { formData.paymentType === "container_expense" && (
                    <div>
                        <Label>Search Container</Label>
                        <AsyncSelect<ContainerOption>
                            cacheOptions
                            defaultOptions
                            loadOptions={loadContainerOptions}
                            placeholder="Search container"
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    containerId: selectedOption?.value ?? 0,
                                }))
                            }
                            isClearable
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            required
                        />
                    </div>
                )}

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
                            currency: selectedOption!.value ?? null,
                        }));
                        }}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
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
                    required
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
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                        required
                    />
                </div>

                {/* Note */}
                <div className="md:col-span-2 xl:col-span-2">
                    <Label>Note</Label>
                    <Input
                        type="text"
                        name="note"
                        placeholder="Optional note"
                        value={formData.note}
                        onChange={handleChange}
                    />
                </div>

                {/* Note */}
                {/* <div className="md:col-span-2">
                    <Label>Payment Details (if have)</Label>
                    <Input
                        type="text"
                        name="paymentDetails"
                        placeholder="Optional payment details"
                        value={formData.paymentDetails}
                        onChange={handleChange}
                    />
                </div> */}
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    <button type="button" onClick={() => navigate("/expense/list")} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.04]">
                        Cancel
                    </button>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
                        <PlusIcon className="h-4 w-4" /> Create expense
                    </button>
                </div>
            </form>
        </div>
    );
}
