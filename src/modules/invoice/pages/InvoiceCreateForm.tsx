import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { unwrapResult } from "@reduxjs/toolkit";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Textarea from "../../../components/form/input/TextArea.tsx";
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

import { OptionStringType, selectStyles, CurrencyOptions } from "../../types.ts";
import { Invoice } from "../features/invoiceTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { create } from "../features/invoiceThunks";
import { AppDispatch } from "../../../store/store";
import { selectAllCategory } from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { fetchAllInvoicePagination } from "../features/invoiceThunks.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllItem, selectAllItemByBusiness } from "../../item/features/itemSelectors.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { ArrowLeftIcon, DocumentPlusIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import AsyncSelect from "react-select/async";
import * as partyAPI from "../../party/features/partyAPI.ts";

export default function InvoiceCreateForm() {
    const { invoiceType } = useParams();
    const isGeneralInvoice = !invoiceType || invoiceType === 'all';
    const isPurchaseInvoice = invoiceType === 'purchase';
    const invoiceLabel = isGeneralInvoice ? 'invoice' : isPurchaseInvoice ? 'purchase' : 'sale';
    const invoiceLabelTitle = isGeneralInvoice ? 'Invoice' : isPurchaseInvoice ? 'Purchase' : 'Sale';
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchAllCategory());
        dispatch(fetchAllStatus());
        dispatch(fetchAllAccount());
        dispatch(fetchAllUnit());
        dispatch(fetchAllItem());
        dispatch(fetchAll());
        if (invoiceType === "sale") dispatch(fetchAllWarehouse());
    }, [dispatch, invoiceType]);
    const categories = useSelector(selectAllCategory);

    const invoices = useSelector(selectAllInvoice);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), invoiceType ?? ''));
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));
    const warehouses = useSelector(selectAllWarehouse);
    const paymentAccounts = useSelector(selectAllAccount);
    const containers = useSelector(selectAllContainer);
    const allItemData = useSelector(selectAllItem);
    const businessItemData = useSelector(selectAllItemByBusiness(user?.business?.id || 0));
    const itemData = businessItemData.length ? businessItemData : allItemData;
    const categoryOptions = categories
        .filter((category) => category.name.toLowerCase() !== "bill")
        .map((category) => ({ label: category.name, value: category.id }));
    const isFinancialCategory = (categoryId?: number | null) => {
        const category = categories.find((entry) => Number(entry.id) === Number(categoryId));
        return ["currency", "gold"].includes(category?.name.toLowerCase() ?? "");
    };
    const itemOptionsForCategory = (categoryId: number) => itemData
        .filter((item) => Number(item.categoryId ?? item.category?.id) === Number(categoryId))
        .map((item) => ({
            label: item.name ?? "",
            value: item.id,
            unit: item.unit,
            itemVat: item.vatPercentage,
            itemType: item.itemType,
            purity: item.purity,
        }));
    
    const [formData, setFormData] = useState<Invoice>({
        businessId: 0,
        invoiceType: invoiceType,
        invoiceRefId: 0,
        partyId: 0,
        date: "",
        note: "",
        items: [{
            itemId: 0,
            categoryId: 0,
            containerId: null,
            containerNo: null,
            uniqueId: Date.now(),
            name: "",
            price: 0,
            quantity: 0,
            vatPercentage: 0,
            unit: "",
            subTotal: 0,
            warehouseId: null,
            warehouseName: "",
            itemGrandTotal: 0,
            system: 1,
            itemVat: 0,
            purity: undefined
        }],
        currency: "AED",
        totalAmount: 0,
        isVat: false,
        isFullPaid: false,
        bankId: 0,
        vatPercentage: 0,
        discount: null,
        grandTotal: 0,
        vatAmount: 0,
        paidTotal: null,
        createdBy: 0,
        system: 1,
        ounceRate: undefined,
        ounceRateGram: undefined,
        discountTotal: 0
    });

    useEffect(() => {
        if (!user) return;

        setFormData((prev) => ({
            ...prev,
            businessId: user.business?.id || 0,
            createdBy: user.id,
            invoiceType: invoiceType,
            vatPercentage: 0,
        }));
    }, [user, invoiceType]);

    const showWarehouseColumn = formData.invoiceType === "sale" &&
        formData.items.some((item) => !isFinancialCategory(item.categoryId));

    // Local state for current item inputs
    const [currentItem, setCurrentItem] = useState<Item>({
        itemId: 0,
        categoryId: 0,
        containerId: null,
        containerNo: null,
        uniqueId: Date.now(), // Generate unique ID for new item
        name: '',
        price: 0,
        quantity: 0,
        vatPercentage: 0,
        unit: '',
        subTotal: 0,
        warehouseId: null,
        warehouseName: '',
        itemGrandTotal: 0,
        system: 1,
        itemVat: 0,
        purity: undefined
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await dispatch(create(formData));
            const createdInvoice = unwrapResult(result);

            toast.success("Invoice created successfully!");
            const invoiceType = ["sale", "fix_sale", "unfix_sale", "wholesale_sale"].includes(formData.invoiceType ?? '')
            ? "sale"
            : "purchase";

            dispatch(fetchAllInvoicePagination({ page: 1, limit: 10, type: invoiceType }));
            navigate(`/invoice/${createdInvoice.id}/view`);
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to create invoice.");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (items: Item[], isVat: boolean, discount: number) => {
        
        const updatedItems = items.map(item => {
            const getItem = itemData.find(i => i.id === item.itemId);
            const vatRate = getItem?.vatPercentage ?? 0;

            // Get selected category name
            const selectedCategory = categories.find(
                (c) => Number(c.id) === Number(item.categoryId)
            )?.name.toLowerCase() ?? "";

            // --- PRICE LOGIC ---
            const itemPrice = selectedCategory === "gold" && Number(item.purity) > 0
            ? formData.ounceRateGram                      // use ounceRate for gold
            : (item.price ?? 0);             // use normal price for others

            const subTotal = (itemPrice ?? 0) * (item.quantity ?? 0);
            const vatAmount = isVat === true ? (subTotal * vatRate) / 100 : 0;

            return {
                ...item,
                itemVat: vatAmount,
                subTotal,
                itemGrandTotal: subTotal + vatAmount,
            };
        });

        const totalSubTotal = updatedItems.reduce((sum, i) => sum + i.subTotal, 0);
        const totalVatTotal = updatedItems.reduce((sum, i) => sum + i.itemVat, 0);
        const totalGrandTotal = updatedItems.reduce((sum, i) => sum + i.itemGrandTotal, 0);
        const discountedTotal = totalGrandTotal - discount;

        return { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal, discountedTotal };
    };
    
    const addItem = () => {
        const selectedCategory = categories.find(
            (c) => Number(c.id) === Number(currentItem.categoryId)
        )?.name.toLowerCase() ?? "";

        // Create item with correct price
        const newItem = {
            ...currentItem,
            uniqueId: Date.now(),
            price: selectedCategory === "gold" && Number(currentItem.purity) > 0 ? formData.ounceRateGram : currentItem.price,
        };

        // Add item (DO NOT recreate it again)
        const newItems = [...formData.items, newItem];

        const {
            updatedItems,
            totalSubTotal,
            totalVatTotal,
            totalGrandTotal
        } = calculateTotals(
            newItems,
            formData.isVat ?? false,
            formData.discount ?? 0
        );

        const vatRate = formData.isVat ? user?.business?.vatPercentage ?? 0 : 0;

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
            vatPercentage: vatRate,
        }));

        // Reset item
        setCurrentItem({
            itemId: 0,
            containerId: null,
            uniqueId: Date.now(),
            name: "",
            price: 0, // <— smart reset
            quantity: 0,
            vatPercentage: 0,
            unit: "",
            subTotal: 0,
            warehouseId: null,
            warehouseName: "",
            itemGrandTotal: 0,
            system: 1,
            itemVat: 0,
        });
    };


    const removeItem = (item: Item) => { 
        const newItems = formData.items.filter(i => 
            i.uniqueId !== item.uniqueId
        );

        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(
            newItems,
            formData.isVat ?? false,
            formData.discount ?? 0
        );

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
        }));
    };


    const handleVatChange = (checked: boolean) => {
        const vatRate = checked ? user?.business?.vatPercentage ?? 0 : 0;

        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(
            formData.items,
            checked ?? false,
            formData.discount ?? 0
        );

        setFormData(prev => ({
            ...prev,
            isVat: checked,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
            vatPercentage: vatRate, // Always set from business VAT
            paidTotal: null,
            isFullPaid: false
        }));

        console.log("VAT toggled:", { isVat: checked, vatRate });
    };

    const handleFullPaidChange = (isfullPaid: boolean) => {
        
        setFormData(prev => ({
            ...prev,
            paidTotal : isfullPaid ? formData.grandTotal : null,
            isFullPaid : isfullPaid
        }));
        
    };

    const loadPartyOptions = async (inputValue: string) => {
        const partyType = invoiceType === 'sale' ? 'customer' : invoiceType === 'purchase' ? 'supplier' : 'all';
        const data = await partyAPI.fetchPartyPaginated({ page: 1, limit: 10, type: partyType, filterText: inputValue });
        return data.parties.map((party) => ({ label: party.name, value: Number(party.id) }));
    };

    // const handleDiscountChange = (value: number) => {
    //     const { updatedItems, total, grandTotal, vatPerc } = calculateTotals(formData.items, formData.isVat, value);
    //     setFormData(prev => ({
    //         ...prev,
    //         discount: value,
    //         items: updatedItems,
    //         totalAmount: total,
    //         grandTotal,
    //         vatPercentage: vatPerc,
    //     }));
    // };


    return (
        <div className="">
        <PageMeta title={`${invoiceLabelTitle} Create`} description="Form to create a new invoice" />
        <PageBreadcrumb pageTitle={`${invoiceLabelTitle} Create`} />

        <section className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08] dark:from-brand-500/10 dark:to-white/[0.03]">
            <div className="flex items-start gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><DocumentPlusIcon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">{invoiceLabelTitle}s</p><h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Create {invoiceLabel} invoice</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add party information, {invoiceLabel} items, and payment details.</p></div></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button type="button" onClick={() => {invoiceType === "purchase" ? navigate(`/invoice/purchase/0/list`) : invoiceType === "sale" ? navigate(`/invoice/sale/0/list`) : navigate(`/invoice/all/0/list`)}} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> {invoiceLabelTitle} list</button></div>
          </div>
          <form className="space-y-6 bg-gray-50/50 p-5 sm:p-6 dark:bg-transparent" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"><div className="mb-4"><h2 className="text-base font-semibold text-gray-900 dark:text-white">Invoice details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set the invoice date, party, type, and payment options.</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {/* Date */}
                    <div>
                        <DatePicker
                            id="date-picker"
                            label="Date"
                            placeholder="Select a date"
                            defaultDate={formData.date || undefined}
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
                    

                    {/* Search Party */}
                    <div>
                        <Label>Select Party</Label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadPartyOptions}
                            placeholder={invoiceType === 'sale' ? "Search and select customer" : invoiceType === 'purchase' ? "Search and select supplier" : "Search and select party"}
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                ...prev,
                                partyId: selectedOption?.value ?? 0,
                                }))
                            }
                            isClearable
                            styles={selectStyles}
                            classNamePrefix="react-select"
                        />
                       
                    </div>
                    

                    {/* isVat */}
                    {/* { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType !== "clearance_bill" && ( */}
                    <div className="flex flex-col items-center text-center">
                        <Label>Select Vat (if have)</Label>
                        <Checkbox className="justify-center"
                            id={`is-vat-check`}
                            label={`Is Vated`}
                            checked={!!formData.isVat}
                            onChange={handleVatChange}
                        />
                    </div>
                    {/* )} */}

                    { formData.items.some((item) => categories.find((c) => Number(c.id) === Number(item.categoryId))?.name.toLowerCase() === "gold") && (
                        <div className="flex">
                            <div>
                                <Label>Gold Rate (Ounce)</Label>
                                <Input
                                    type="number"
                                    name="ounceRate"
                                    value={formData.ounceRate}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = Number(e.target.value);
                                        const gramRate = Number(((value / 31.1034768) * 3.67).toFixed(2));

                                        setFormData(prev => ({
                                            ...prev,
                                            ounceRate: value,
                                            ounceRateGram: gramRate
                                        }));

                                        const updatedItems = formData.items.map((item) => ({
                                            ...item,
                                            price:
                                                categories.find((c) => Number(c.id) === Number(item.categoryId))?.name.toLowerCase() === "gold" && Number(item.purity) > 0
                                                    ? gramRate            // gold → price = ounceRate
                                                    : item.price,      // others → keep existing price
                                        }));

                                        // Recalculate totals
                                        const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal } =
                                        calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                        setFormData((prev) => ({
                                            ...prev,
                                            items: recalculated,
                                            totalAmount: totalSubTotal,
                                            grandTotal: totalGrandTotal,
                                            vatAmount: totalVatTotal,
                                        }));
                                    }}
                                    placeholder="0.00"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                />
                            </div>
                            <div className="flex items-center pt-5 pl-2">=</div>
                            <div className="ml-2">
                                <Label>Gold Rate (Gram)</Label>
                                <Input
                                    type="number"
                                    name="ounceRateGram"
                                    value={formData.ounceRateGram}
                                    placeholder="0.00"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                    readonly={true}
                                />
                            </div>
                        </div>
                        
                        
                    )}
                </div></div>

                {/* Items Table */}
                <Table className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                        <TableRow>
                            <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Category</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Item</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Container</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Quantity</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Unit</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Price</TableCell>
                            <TableCell isHeader className="text-center px-4 py-2">Sub-Total</TableCell>
                            {showWarehouseColumn && (
                            <TableCell isHeader className="text-center px-4 py-2">Warehouse</TableCell>
                            )}
                            <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {formData.items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                                No items added yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        formData.items.map((item, index) => (
                        <TableRow key={item.uniqueId}>
                            <TableCell className="text-center px-4 py-2">{index + 1}</TableCell>
                            <TableCell className="text-center px-4 py-2">
                                <div>
                        
                                    <Select
                                        options={categoryOptions}
                                        placeholder="Search and select category"
                                        value={
                                            categoryOptions.find((option) => Number(option.value) === Number(item.categoryId)) || null
                                        }
                                        onChange={(selectedOption) =>{
                                            const updatedItems = [...formData.items];
                                            
                                            updatedItems[index] = {
                                                ...updatedItems[index],
                                                categoryId: selectedOption?.value ?? 0,
                                                itemId: 0,
                                                name: "",
                                                unit: "",
                                                price: 0,
                                                purity: undefined,
                                            };
                                            const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(
                                                updatedItems,
                                                formData.isVat ?? false,
                                                formData.discount ?? 0
                                            );
                                            setFormData((prev) => ({
                                                ...prev,
                                                items: recalculated,
                                                totalAmount: totalSubTotal,
                                                grandTotal: totalGrandTotal,
                                                vatAmount: totalVatTotal,
                                            }));
                                        }}
                                        isClearable
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        classNamePrefix="react-select"
                                        required
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-center px-4 py-2">
                                <Select
                                    options={itemOptionsForCategory(Number(item.categoryId))}
                                    placeholder="Select item"
                                    value={itemOptionsForCategory(Number(item.categoryId)).find((option) => Number(option.value) === Number(formData.items[index].itemId)) || null}
                                    onChange={(selectedOption) => {
                                        
                                        // Prevent duplicate itemType
                                        const duplicate = formData.items.some(
                                            (itm, idx) => idx !== index && itm.itemType === selectedOption?.itemType
                                        );

                                        if (duplicate) {
                                            toast.error("You can not add same type of item");
                                            return;
                                        }

                                        // Update selected item
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                            ...updatedItems[index],
                                            itemId: selectedOption?.value,
                                            name: selectedOption?.label,
                                            unit: selectedOption?.unit ?? "",
                                            vatPercentage: selectedOption?.itemVat ?? 0,
                                            itemType: selectedOption?.itemType ?? "",
                                            purity: selectedOption?.purity
                                        };

                                        // Recalculate totals
                                        const {
                                            updatedItems: recalculated,
                                            totalSubTotal,
                                            totalVatTotal,
                                            totalGrandTotal,
                                        } = calculateTotals(
                                            updatedItems,
                                            formData.isVat ?? false,
                                            formData.discount ?? 0
                                        );

                                        setFormData((prev) => ({
                                            ...prev,
                                            items: recalculated,
                                            totalAmount: totalSubTotal,
                                            grandTotal: totalGrandTotal,
                                            vatAmount: totalVatTotal,
                                            vatPercentage: formData.isVat ? user?.business?.vatPercentage : 0,
                                        }));
                                    }}
                                    isClearable
                                    styles={selectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    classNamePrefix="react-select"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                    <Select
                                        options={
                                            containers?.map((i) => ({
                                            label: `${i.containerNo}`,
                                            value: i.id,
                                            })) || []
                                        }
                                        placeholder="Select container"
                                        value={
                                            containers
                                            .map((w) => ({ label: w.containerNo, value: w.id }))
                                            .find((option) => option.value === formData.items[index]?.containerId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            const updatedItems = [...formData.items];
                                            updatedItems[index] = {
                                            ...updatedItems[index],
                                            containerId: selectedOption?.value ?? null,
                                            containerNo: selectedOption?.label ?? null,
                                            };
                                            setFormData((prev) => ({
                                            ...prev,
                                            items: updatedItems,
                                            }));
                                        }}
                                        isClearable
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        classNamePrefix="react-select"
                                    />
                                </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                <Input
                                    type="number"
                                    name="quantity"
                                    value={formData.items[index]?.quantity || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = Number(e.target.value);
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                            ...updatedItems[index],
                                            quantity: value,
                                            price: Number(updatedItems[index].purity) > 0 && Number(formData.ounceRateGram) > 0 ? formData.ounceRateGram : 0
                                        };

                                        // Recalculate totals
                                        const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal, discountedTotal } =
                                        calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                        setFormData((prev) => ({
                                            ...prev,
                                            items: recalculated,
                                            totalAmount: totalSubTotal,
                                            grandTotal: totalGrandTotal,
                                            vatAmount: totalVatTotal,
                                            discountTotal: discountedTotal,
                                        }));
                                    }}
                                    placeholder="0"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
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
                                        .find((option) => option.value === formData.items[index]?.unit) || null
                                    }
                                    onChange={(selectedOption) => {
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                        ...updatedItems[index],
                                        unit: selectedOption?.value ?? '',
                                        };
                                        setFormData((prev) => ({
                                        ...prev,
                                        items: updatedItems,
                                        }));
                                    }}
                                    isClearable
                                    styles={selectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    classNamePrefix="react-select"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.items[index]?.price || ''}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const value = Number(e.target.value);
                                        const updatedItems = [...formData.items];
                                        updatedItems[index] = {
                                            ...updatedItems[index],
                                            price: value,
                                        };

                                        // Recalculate totals
                                        const { updatedItems: recalculated, totalSubTotal, totalVatTotal, totalGrandTotal, discountedTotal } =
                                        calculateTotals(updatedItems, formData.isVat ?? false, formData.discount ?? 0);

                                        setFormData((prev) => ({
                                            ...prev,
                                            items: recalculated,
                                            totalAmount: totalSubTotal,
                                            grandTotal: totalGrandTotal,
                                            vatAmount: totalVatTotal,
                                            discountTotal: discountedTotal,
                                        }));
                                    }}
                                    placeholder="0.00"
                                    min="0"
                                    step={0.01}
                                    className="max-w-40"
                                />
                            </TableCell>

                            <TableCell className="text-center px-4 py-2">{((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</TableCell>

                            {showWarehouseColumn && (
                                <TableCell className="text-center px-4 py-2">
                                  {isFinancialCategory(item.categoryId) ? "-" : (
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
                                            .find((option) => option.value === formData.items[index]?.warehouseId) || null
                                        }
                                        onChange={(selectedOption) => {
                                            const updatedItems = [...formData.items];
                                            updatedItems[index] = {
                                            ...updatedItems[index],
                                            warehouseId: selectedOption ? Number(selectedOption.value) : null,
                                            warehouseName: selectedOption?.label ?? "",
                                            };
                                            setFormData((prev) => ({
                                            ...prev,
                                            items: updatedItems,
                                            }));
                                        }}
                                        isClearable
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        classNamePrefix="react-select"
                                    />
                                  )}
                                </TableCell>
                            )}

                            <TableCell className="text-center px-4 py-2">
                                <button
                                    onClick={() => removeItem(item)}
                                    className="text-red-500 hover:underline"
                                    type="button"
                                >
                                Remove
                                </button>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>

                <div className="flex justify-end items-end mt-4">
                    <Button 
                        type="button" 
                        onClick={addItem} 
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md shadow"
                    >
                        Add Item
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Note */}
                    <div>
                        <Label>Description / Note</Label>
                        <Textarea
                            placeholder="Enter your note here"
                            value={formData.note}
                            onChange={(value) => {
                            setFormData(prev => ({
                                ...prev,
                                note: value
                            }));
                        }}
                        />
                    </div>

                    <Table>
                        <TableHeader className="border border-gray-500 dark:border-white/[0.05] text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                            <TableRow>
                                <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Total Amount</TableCell>
                                <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Vat Amount</TableCell>
                                <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Net Amount</TableCell>
                                <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Discount</TableCell>
                                <TableCell isHeader className="border border-gray-500 text-center px-4 py-2">Grand Total</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            <TableRow>
                                <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.totalAmount?.toFixed(2)}</TableCell>
                                <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.vatAmount?.toFixed(2)}</TableCell>
                                <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{formData.grandTotal?.toFixed(2)}</TableCell>
                                <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold w-40">
                                        <Input
                                            type="number"
                                            name="discount"
                                            placeholder="0.00"
                                            value={formData.discount ?? ''}  // show empty if undefined
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;

                                                setFormData(prev => {
                                                    const updatedForm = {
                                                        ...prev,
                                                        discount: value === '' ? undefined : Number(value) // ensure number
                                                    };

                                                    // Recalculate totals with new discount
                                                    const {
                                                        updatedItems: recalculated,
                                                        totalSubTotal,
                                                        totalVatTotal,
                                                        totalGrandTotal,
                                                        discountedTotal
                                                    } = calculateTotals(
                                                        updatedForm.items,
                                                        updatedForm.isVat ?? false,
                                                        updatedForm.discount ?? 0
                                                    );

                                                    return {
                                                        ...updatedForm,
                                                        items: recalculated,
                                                        totalAmount: totalSubTotal,
                                                        grandTotal: totalGrandTotal,
                                                        vatAmount: totalVatTotal,
                                                        discountTotal: discountedTotal
                                                    };
                                                });
                                            }}
                                            min="0"
                                            step={0.01}
                                        />
                                </TableCell>
                                <TableCell className="border border-gray-500 text-center px-4 py-2 font-semibold">{((formData.grandTotal ?? 0) - (formData.discount ?? 0)).toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                

                <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mt-2">
                    <div></div>
                    <div></div>
                    <div></div>
                    { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                    <>
                        {/* isFull Paid */}
                        <div className="flex items-center pt-5 pl-2">
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

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]"><p className="text-sm text-gray-500 dark:text-gray-400">Review all {invoiceLabel} items and totals before creating the invoice.</p>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={loading}
                        >
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
            </div>
            </form>
        </section>
        </div>
    );
}
