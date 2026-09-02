import { FormEvent, ChangeEvent, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import Select from "react-select";
import { ArrowLeftIcon, CubeIcon, ListBulletIcon } from "@heroicons/react/20/solid";

import { AppDispatch } from "../../../store/store.ts";
import { OptionStringType, MovementTypeOptions, selectStyles } from "../../types.ts";
import { Stock } from "../features/stockTypes.ts";

import { create } from "../features/stockThunks.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { fetchAll as fetchContainer } from "../../container/features/containerThunks.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { selectAllItem } from "../../item/features/itemSelectors.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";


export default function StockCreateForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if(invoices.length === 0){
            dispatch(fetchAllInvoice());
        }
        dispatch(fetchContainer());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllCategory());
        dispatch(fetchAllItem());
        dispatch(fetchAllAccount());
        dispatch(fetchAllUnit());
    }, [dispatch]);

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    // console.log("Invoice authUser: ", authUser);
    // console.log("Invoice user: ", user);

    const items = useSelector(selectAllItem);
    const invoices = useSelector(selectAllInvoice);
    const warehouses = useSelector(selectAllWarehouse);
    const categories = useSelector(selectAllCategory);
    const paymentAccounts = useSelector(selectAllAccount);
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));

    

    const [formData, setFormData] = useState<Stock>({
        businessId: 0,
        date: '',
        invoiceType: undefined,        
        invoiceId: undefined,
        partyId: 0,
        categoryId: 0,
        itemId: 0,
        containerId: null,
        movementType: '',
        warehouseId: null,
        bankId: null,
        quantity: 0,
        unit: ''
    });

    const containers = useSelector(selectAllContainer);

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
            [name]: name === "partyId" || name === "categoryId" || name === "quantity" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        try {
            // Dispatch create action, including totalAmount
            console.log("Stock formData: ", formData);
            await dispatch(create(formData)).unwrap();
            toast.success("Stock created successfully!");

            navigate(`/stock/list`);
        } catch (err) {
            toast.error("Failed to create stock.");
        }
    };

    const handleList = () => {
        navigate(`/stock/list`);
    };

    const selectedCategory = useMemo(
        () => categories.find((category) => category.id === formData.categoryId),
        [categories, formData.categoryId],
    );
    const isFinancialStock = ["currency", "gold"].includes(selectedCategory?.name.toLowerCase() ?? "");
    const selectMenuStyles = {
        ...selectStyles,
        menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }),
    };

    return (
        <div className="mx-auto max-w-7xl">
        <PageMeta title="Stock Create" description="Form to create a new stock" />
        <PageBreadcrumb pageTitle="Stock Create" />

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><CubeIcon className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Inventory</p>
                        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create stock movement</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record incoming, outgoing, or damaged stock.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
                    <button onClick={handleList} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ListBulletIcon className="h-4 w-4" /> Stock list</button>
                </div>
            </div>

            <form className="space-y-6 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div>
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Movement details</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start with the source document, movement type, and date.</p>
                </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                

                {/* Invoice Type */}
                <div>
                    <Label>Select Invoice Ref</Label>
                    <Select
                        options={invoices.map((i) => ({
                            label: `#${i.invoiceNo ?? "No name"}`,
                            value: i.id,
                            invoiceType: i.invoiceType,
                            categoryId: i.categoryId,
                            partyId: i.partyId
                        }))}
                        placeholder="Select invoice type"
                        value={invoices.map((i) => ({ label: `#${i.invoiceNo ?? "No name"}`, value: i.id, invoiceType: i.invoiceType, categoryId: i.categoryId, partyId: i.partyId })).find((option) => option.value === formData.invoiceId) ?? null}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({
                                ...prev,
                                invoiceId: selectedOption ? Number(selectedOption.value) : undefined,
                                invoiceType: selectedOption?.invoiceType,
                                categoryId: selectedOption ? Number(selectedOption.categoryId) : 0,
                                partyId: selectedOption ? Number(selectedOption.partyId) : 0
                            }));
                        }}
                        isClearable
                        styles={selectMenuStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                    />
                </div>

                {/* Invoice Type */}
                <div>
                    <Label>Select Movement Type</Label>
                    <Select<OptionStringType>
                        options={MovementTypeOptions}
                        placeholder="Select movement type"
                        value={MovementTypeOptions.find(option => option.value === formData.movementType)}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({
                                ...prev,
                                movementType: selectedOption!.value,
                            }));
                        }}
                        styles={selectMenuStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                        required
                    />
                </div>

                {/* Date */}
                <div>
                    <DatePicker
                        id="date-picker"
                        label="Date"
                        placeholder="Select a date"
                        inputClassName="h-10 rounded-md px-3 py-2"
                        defaultDate={formData.date}
                        onChange={(dates, currentDateString) => {
                            console.log({ dates, currentDateString });
                            setFormData((prev) => ({
                                ...prev!,
                                date: currentDateString, 
                            }));
                        }}
                    />
                </div>

                <div>
                    <Label>Select Item</Label>
                    <Select
                        options={
                        items?.map(i => ({
                            label: i.name,
                            value: i.id,
                            unit: i.unit ?? '',
                        })) || []
                        }
                        placeholder="Search and select item"
                        value={
                        items
                            ?.filter(i => i.id === formData.itemId)
                            .map(i => ({ label: i.name, value: i.id, unit: i.unit ?? '' }))[0] || null
                        }
                        onChange={(selectedOption) =>
                        setFormData((prev) => ({
                            ...prev,
                            itemId: Number(selectedOption?.value) || 0,
                            unit: selectedOption?.unit ?? '',
                        }))
                        }
                        isClearable
                        styles={selectMenuStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                        required
                    />
                </div>

                {!isFinancialStock && (
                    <div>
                        <Label>Select Container</Label>
                        <Select
                            options={containers.map((i) => ({
                                label: `${i.containerNo}`,
                                value: i.id,
                            })) || []}
                                placeholder="Search and select container"
                            value={
                                containers
                                .map((i) => ({
                                    label: `${i.containerNo}`,
                                    value: i.id,
                                }))
                                .find((opt) => opt.value === formData.containerId) || null
                            }
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    containerId: selectedOption ? Number(selectedOption.value) : null,
                                }))
                            }
                            isClearable
                            styles={selectMenuStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            required
                        />

                    </div>
                )}

                <div className="col-span-full border-t border-gray-100 pt-5 dark:border-white/[0.08]">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quantity and destination</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set the amount and where this stock is held.</p>
                </div>

                {/* Paid Amount */}
                <div>
                <Label>Quantity</Label>
                <Input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={formData.quantity || ""}
                    onChange={handleChange}
                    step={0.01}
                    required
                />
                </div>

                <div>
                    <Label>Unit</Label>
                    <Select
                        options={
                        UnitOptions
                            .map((i) => ({
                                label: `${i.name}`,
                                value: i.name,
                            })) || []
                        }
                        placeholder="Select Unit"
                        value={UnitOptions.map((unit) => ({ label: unit.name, value: unit.name })).find((option) => option.value === formData.unit) ?? (formData.unit ? { label: formData.unit, value: formData.unit } : null)}
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                unit: selectedOption?.value ?? '',
                            }))
                        }
                        isClearable
                        styles={selectMenuStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                        required
                    />
                </div>

                {!isFinancialStock && (
                    <div>
                        <Label>Select Warehouse</Label>
                        <Select
                            options={
                            warehouses
                                .map((w) => ({
                                    label: `${w.name}`,
                                    value: w.id,
                                })) || []
                            }
                            placeholder="Search and select warehouse"
                            value={
                                warehouses
                                ?.filter((w) => w.id === formData.warehouseId)
                                .map((w) => ({ label: w.name, value: w.id }))[0] || null
                            }
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    warehouseId: selectedOption ? Number(selectedOption.value) : null,
                                }))
                            }
                            isClearable
                            styles={selectMenuStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            required
                        />
                    </div>
                )}

                {isFinancialStock && (
                    <div>
                        <Label>Select Stock Account</Label>
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
                                    bankId: selectedOption ? Number(selectedOption.value) : null,
                                }))
                            }
                            isClearable
                            styles={selectMenuStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            classNamePrefix="react-select"
                            required
                        />
                    </div>
                )}
            </div>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fields marked required must be completed before saving.</p>
                <Button type="submit" variant="success">
                Create stock movement
                </Button>
            </div>
            </form>
        </section>
        </div>
    );
}
