import { FormEvent, ChangeEvent, useState, useEffect, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import Checkbox from "../../../components/form/input/Checkbox.tsx";
import { ArrowLeftIcon, ListBulletIcon, PlusIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";

import { OptionStringType, selectStyles, CurrencyOptions } from "../../types.ts";
import { Invoice } from "../features/invoiceTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { create } from "../features/invoiceThunks";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { AppDispatch } from "../../../store/store";
import { selectAllParties } from "../../party/features/partySelectors";
import { selectAllCategory, selectCategoryById } from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

export default function SellCreateForm() {
    const invoiceType = 'sale';
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));

    useEffect(() => {
        dispatch(fetchParty({ type: "all" }));
        dispatch(fetchAllCategory());
        dispatch(fetchAll());
        dispatch(fetchAllUnit());
        dispatch(fetchAllStatus());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllAccount());
    }, [dispatch]);

    const matchingParties = useSelector(selectAllParties);
    const categories = useSelector(selectAllCategory);
    const invoices = useSelector(selectAllInvoice);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), 'sale'));
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));
    const warehouses = useSelector(selectAllWarehouse);
    const paymentAccounts = useSelector(selectAllAccount);
    const containers = useSelector(selectAllContainer);
    const itemCategoryOptions = useMemo(
        () => categories.map((category) => ({ label: category.name, value: Number(category.id) })),
        [categories],
    );
    
    const [formData, setFormData] = useState<Invoice>({
        businessId: 0,
        invoiceType: invoiceType,
        invoiceRefId: 0,
        partyId: 0,
        date: "",
        note: "",
        items: [],
        currency: "AED",
        totalAmount: 0,
        isVat: true,
        isFullPaid: false,
        bankId: 0,
        vatPercentage: 0,
        discount: 0,
        grandTotal: 0,
        paidTotal: null,
        createdBy: 0,
        system: 2,
    });

    useEffect(() => {
        if (user?.business?.id) {
          setFormData((prev) => ({
            ...prev,
            businessId: user?.business?.id,
            createdBy: user.id
          }));
        }

        setFormData((prev) => ({
            ...prev,
            invoiceType: invoiceType,
        }));
    }, [user, invoiceType]);

    // Local state for current item inputs
    const [currentItem, setCurrentItem] = useState<Item>({
        categoryId: 0,
        itemId: 0,
        containerId: null,
        uniqueId: Date.now(), // Generate unique ID for new item
        name: '',
        price: 0,
        quantity: 0,
        itemVat: 0,
        unit: '',
        subTotal: 0,
        warehouseId: null,
        warehouseName: '',
        itemGrandTotal: 0,
        system: 2,
        vatPercentage: 0
    });
    const currentItemCategory = useSelector(selectCategoryById(Number(currentItem.categoryId)));

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" ? Number(value) : value,
        }));
    };

    const handleCurrentItemChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: name === "price" || name === "quantity" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            console.log("formData: ", formData);
            await dispatch(create(formData));
            toast.success("Invoice created successfully!");
            const categoryId = 0;
            navigate(`/invoice/sell/${categoryId}/list`);
        } catch (err) {
            toast.error("Failed to create invoice.");
        }
    };

    const calculateTotals = (items: Item[], isVat: boolean, discount: number) => {
        const vatPerc = isVat ? (user?.business?.vatPercentage ?? 0) : 0;

        const updatedItems = items.map(item => {
            const subTotal = (item.price ?? 0) * (item.quantity ?? 0);
            const vatAmount = (subTotal * vatPerc) / 100;
            return {
                ...item,
                itemVat: vatPerc,
                subTotal,
                itemGrandTotal: subTotal + vatAmount,
            };
        });

        const total = updatedItems.reduce((sum, i) => sum + i.subTotal, 0);
        const discountedTotal = Math.max(0, total - discount);
        const totalVat = isVat ? (discountedTotal * vatPerc) / 100 : 0;
        const grandTotal = discountedTotal + totalVat;

        return { updatedItems, total, grandTotal, vatPerc };
    };
    
    const addItem = () => {
        if (
            !currentItem.categoryId ||
            !currentItem.itemId ||
            (currentItem.price ?? 0) <= 0 ||
            (currentItem.quantity ?? 0) <= 0
        ) {
            toast.error("Please fill all item fields properly");
            return;
        }

        const newItems = [...formData.items, { ...currentItem, uniqueId: Date.now() }];
        const { updatedItems, total, grandTotal, vatPerc } = calculateTotals(newItems, formData.isVat ?? false, formData.discount ?? 0);

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: total,
            grandTotal,
            vatPercentage: vatPerc,
        }));

        setCurrentItem({
            categoryId: 0,
            itemId: 0,
            containerId: null,
            uniqueId: Date.now(),
            name: '',
            price: 0,
            quantity: 0,
            itemVat: 0,
            unit: '',
            subTotal: 0,
            warehouseId: null,
            warehouseName: "",
            itemGrandTotal: 0,
            system: 2,
            vatPercentage: 0
        });
    };

    const removeItem = (item: Item) => {
        const newItems = formData.items.filter(i => i.uniqueId !== item.uniqueId);
        const { updatedItems, total, grandTotal, vatPerc } = calculateTotals(newItems, formData.isVat ?? false, formData.discount ?? 0);

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: total,
            grandTotal,
            vatPercentage: vatPerc,
        }));
    };

    const handleFullPaidChange = (isfullPaid: boolean) => {
        
        setFormData(prev => ({
            ...prev,
            paidTotal : isfullPaid ? formData.grandTotal : null,
            isFullPaid : isfullPaid
        }));
        
    };

    return (
        <div className="w-full">
        <PageMeta title={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} Create`} description="Form to create a new invoice" />
        <PageBreadcrumb pageTitle={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} Create`} />

        <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08]">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><ShoppingCartIcon className="h-6 w-6" /></div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Sales</p>
                        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create sale invoice</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add customer details, line items, and payment information.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
                    <button type="button" onClick={() => navigate(`/invoice/sell/0/list`)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300 dark:hover:bg-white/[0.06]"><ListBulletIcon className="h-4 w-4" /> Sale list</button>
                </div>
            </div>

            <form className="space-y-7 p-5 sm:p-6" onSubmit={handleSubmit}>
                <div>
                    <div className="mb-4"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Invoice details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set the sale category, customer, date, and payment currency.</p></div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {/* Invoice Type */}
                    <div>
                        <Label>Select Invoice Type</Label>
                        <Select
                            options={InvoiceTypeOptions}
                            placeholder="Select invoice type"
                            value={InvoiceTypeOptions.find(option => option.value === formData.invoiceType)}
                            onChange={(selectedOption) => {
                                setFormData(prev => ({
                                    ...prev,
                                    invoiceType: selectedOption!.value,
                                }));
                            }}
                            styles={selectStyles}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.value}
                            classNamePrefix="react-select"
                            required
                        />
                    </div>

                    {/* Invoice Ref ID */}
                    { formData.invoiceType === "saleReturn" && (
                        <div>
                            <Label>Search Invoice Ref (if have)</Label>
                            <Select
                                options={invoices.map((i) => ({
                                    label: String(i.id),
                                    value: Number(i.id),
                                    partyId: Number(i.partyId)
                                }))}
                                placeholder="Select invoice type"

                                onChange={(selectedOption) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        invoiceRefId: selectedOption!.value,
                                        partyId: selectedOption!.partyId,
                                    }));
                                }}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                                required
                            />
                        </div>
                    )}
                    

                    {/* Search Party */}
                    <div>
                        <Label>Select Party</Label>
                        <Select
                            options={matchingParties.map((p) => ({
                                label: p.name,
                                value: p.id,
                            }))}
                            placeholder="Select party"
                            value={
                                matchingParties
                                    .filter((p) => p.id === formData.partyId)
                                    .map((p) => ({ label: p.name, value: p.id }))[0] || null
                            }
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    partyId: selectedOption?.value ?? 0,
                                }))
                            }
                            isClearable
                            styles={selectStyles}
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
                            defaultDate={formData.date}
                            onChange={(dates, currentDateString) => {
                                // Handle your logic
                                console.log({ dates, currentDateString });
                                setFormData((prev) => ({
                                    ...prev!,
                                    date: currentDateString,
                                }))
                            }}
                        />
                        
                    </div>

                    {/* Currency */}
                    <div>
                        <Label>Payment Currency</Label>
                        <Select<OptionStringType>
                            options={CurrencyOptions}
                            placeholder="Select currency"
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

                    {/* isVat */}
                    {/* { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType !== "clearance_bill" && (
                    <div className="flex flex-col items-center text-center">
                        <Label>Select Vat (if have)</Label>
                        <Checkbox className="justify-center"
                            key={formData.id}
                            id={`is-vat-check`}
                            label={`Is Vated`}
                            checked={!!formData.isVat}
                            onChange={handleVatChange}
                        />
                    </div>
                    )} */}


                    {/* Note */}
                    <div className="md:col-span-2">
                        <Label>Description / Note</Label>
                        <Input
                            type="text"
                            name="note"
                            placeholder="Optional note"
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                </div>

                {/* Add Item Section */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-gray-900 dark:text-white">Add line item</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select an item, then add its quantity and selling price.</p></div><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">{formData.items.length} items</span></div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <div>
                            <Label>Select Category</Label>
                            <Select
                                options={itemCategoryOptions}
                                placeholder="Select category"
                                value={itemCategoryOptions.find((option) => option.value === Number(currentItem.categoryId)) || null}
                                onChange={(selectedOption) => setCurrentItem((prev) => ({ ...prev, categoryId: selectedOption ? Number(selectedOption.value) : 0, itemId: 0, name: '', unit: '', containerId: null, warehouseId: null, warehouseName: '' }))}
                                isClearable
                                styles={{ ...selectStyles, menuPortal: (base: Record<string, unknown>) => ({ ...base, zIndex: 9999 }) }}
                                classNamePrefix="react-select"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                            />
                        </div>
                        <div>
                            <Label>Search Item Name</Label>
                            <Select
                                options={
                                    currentItemCategory?.items?.map((i) => ({
                                        label: i.name,
                                        value: i.id,
                                    })) || []
                                }
                                placeholder="Select item"
                                value={
                                    currentItemCategory?.items
                                    ?.filter((i) => i.id === currentItem.itemId)
                                    .map((i) => ({ label: i.name, value: i.id }))[0] || null
                                }
                                onChange={(selectedOption) =>
                                    setCurrentItem((prev) => ({
                                        ...prev,
                                        itemId: selectedOption?.value,
                                        name: selectedOption?.label ?? '',
                                    }))
                                }
                                isClearable
                                styles={selectStyles}
                                classNamePrefix="react-select"
                            />
                        </div>

                        {!categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && (
                            <div>
                                <Label>Container</Label>
                                <Select
                                    options={
                                    containers
                                        ?.map((i) => ({
                                            label: `${i.containerNo}`,
                                            value: i.id,
                                        })) || []
                                    }
                                    placeholder="Select container"
                                    value={
                                        containers
                                        .map((w) => ({ label: w.containerNo, value: w.id }))
                                        .find((option) => option.value === currentItem.containerId) || null
                                    }
                                    onChange={(selectedOption) =>
                                        setCurrentItem((prev) => ({
                                            ...prev,
                                            containerId: selectedOption?.value ?? null,
                                        }))
                                    }
                                    isClearable
                                    styles={selectStyles}
                                    classNamePrefix="react-select"
                                />
                            </div>
                        )}

                        <div>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                name="quantity"
                                value={Number(currentItem.quantity) > 0 ? currentItem.quantity : ''}
                                onChange={handleCurrentItemChange}
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div>
                            <Label>Unit</Label>
                            <Select
                                options={
                                    UnitOptions?.map((i) => ({
                                        label: i.name,
                                        value: i.name,
                                    })) || []
                                }
                                placeholder="Select unit"
                                value={
                                    UnitOptions?.map((u) => ({ label: u.name, value: u.name }))
                                        .find((option) => option.value === currentItem.unit) || null
                                }
                                onChange={(selectedOption) =>
                                    setCurrentItem((prev) => ({
                                        ...prev,
                                        unit: String(selectedOption?.value) ?? '',
                                    }))
                                }
                                isClearable
                                styles={selectStyles}
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div>
                            <Label>Price</Label>
                            <Input
                                type="number"
                                name="price"
                                value={Number(currentItem.price) > 0 ? currentItem.price : ''}
                                onChange={handleCurrentItemChange}
                                placeholder="0.00"
                                min="0"
                                step={0.01}
                            />
                        </div>

                        { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                            <div>
                                <Label>Select Warehouse</Label>
                                <Select
                                    options={
                                    warehouses?.map((w) => ({
                                        label: w.name,
                                        value: w.id,
                                    })) || []
                                    }
                                    placeholder="Select warehouse"
                                    value={
                                        warehouses
                                        .map((w) => ({ label: w.name, value: w.id }))
                                        .find((option) => option.value === currentItem.warehouseId) || null
                                    }
                                    onChange={(selectedOption) =>
                                    setCurrentItem((prev) => ({
                                        ...prev,
                                        warehouseId: selectedOption ? Number(selectedOption.value) : null,
                                        warehouseName: selectedOption?.label ?? "",
                                    }))
                                    }
                                    isClearable
                                    styles={selectStyles}
                                    classNamePrefix="react-select"
                                />
                            </div>
                        )}
                        

                        <div className="flex items-end">
                            <Button type="button" onClick={addItem} className="w-full">
                                <span className="inline-flex items-center gap-2"><PlusIcon className="h-4 w-4" /> Add item</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/[0.08]"><Table className="min-w-[760px]">
                    <TableHeader className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                    <TableRow>
                        <TableCell isHeader className="px-4 py-3 first:pl-6">#</TableCell>
                        <TableCell isHeader className="px-4 py-3">Category</TableCell>
                        <TableCell isHeader className="px-4 py-3">Item</TableCell>
                        <TableCell isHeader className="px-4 py-3">Quantity</TableCell>
                        <TableCell isHeader className="px-4 py-3">Unit</TableCell>
                        <TableCell isHeader className="px-4 py-3">Price</TableCell>
                        <TableCell isHeader className="px-4 py-3">Sub-total</TableCell>
                        { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                        <TableCell isHeader className="text-center px-4 py-2">Warehouse</TableCell>
                        )}
                        <TableCell isHeader className="px-4 py-3 text-right last:pr-6">Action</TableCell>
                    </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {formData.items.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={8 + (!categories.find((category) => ["currency", "gold"].includes(category.name.toLowerCase())) && formData.invoiceType === "sale" ? 1 : 0)} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            Add your first item to begin this sale.
                        </TableCell>
                        </TableRow>
                    ) : (
                        formData.items.map((item, index) => (
                        <TableRow key={index+1} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03]">
                            <TableCell className="px-4 py-3 text-sm text-gray-400 first:pl-6">{index + 1}</TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{categories.find((category) => category.id === item.categoryId)?.name || '-'}</TableCell>
                            <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{item.name}</TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.quantity}</TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.unit}</TableCell>
                            <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item?.price?.toFixed(2)}</TableCell>
                            <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100">{((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</TableCell>
                            { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                            <TableCell className="text-center px-4 py-2">{item?.warehouseName}</TableCell>
                            )}
                            <TableCell className="px-4 py-3 text-right last:pr-6">
                            <button
                                onClick={() => removeItem(item)}
                                className="text-sm font-medium text-rose-600 hover:text-rose-700"
                                type="button"
                            >
                                Remove
                            </button>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table></div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6"><div className="mb-4"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Payment summary</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review totals and record the amount received.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">

                    {/* Total Amount */}
                    <div>
                        <Label>Total Amount</Label>
                        <Input
                            type="number"
                            name="totalAmount"
                            placeholder="0"
                            value={formData.totalAmount.toFixed(2)}
                            readonly={true}
                        />
                    </div>

                    

                    {/* Grand Amount */}
                    <div>
                        <Label>Grand Total</Label>
                        <Input
                            type="number"
                            name="grandTotal"
                            placeholder="0"
                            value={formData.grandTotal?.toFixed(2)}
                            readonly={true}
                        />
                    </div>

                    

                   
                    { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                    <>
                        {/* isFull Paid */}
                        <div className="flex flex-col items-center text-center">
                            <Label>Select Full Received</Label>
                            <Checkbox className="justify-center"
                                key={`is-fullpaid-check-${formData.id}`}
                                id={`is-fullpaid-check`}
                                label={`Is Full Received`}
                                checked={!!formData.isFullPaid}
                                onChange={handleFullPaidChange}
                            />
                        </div>

                        {/* Paid Amount */}
                        <div>
                            <Label>Received Amount</Label>
                            <Input
                                type="number"
                                name="paidTotal"
                                placeholder="0"
                                onChange={handleChange}
                                value={formData.paidTotal ?? ''}
                            />
                        </div>

                        {/* Payment Account */}
                        <div>
                            <Label>Received Account</Label>
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
                            />
                        </div>
                    </>
                    )}
                </div>

                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formData.items.length} line item{formData.items.length === 1 ? '' : 's'} ready to submit.</p>
                    <Button type="submit" variant="success">
                    Create sale invoice
                    </Button>
                </div>
            </form>
        </section>
        </div>
    );
}
