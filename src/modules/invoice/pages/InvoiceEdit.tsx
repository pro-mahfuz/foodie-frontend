import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
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
} from "../../../components/ui/table";
import Checkbox from "../../../components/form/input/Checkbox.tsx";

import { OptionStringType } from "../../types.ts";
import { Invoice } from "../features/invoiceTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { update, fetchById, fetchAllInvoicePagination } from "../features/invoiceThunks";

import { AppDispatch } from "../../../store/store";
import { selectAllParties } from "../../party/features/partySelectors";
import {
  selectAllCategory,
  selectCategoryById,
} from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { selectInvoiceById } from "../features/invoiceSelectors";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { selectAllInvoice, selectInvoiceStatus } from "../../invoice/features/invoiceSelectors.ts";

import { selectStyles, CurrencyOptions } from "../../types.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllItemByBusiness } from "../../item/features/itemSelectors.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";

export default function InvoiceEdit() {
    const { id } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [invoiceTypeName, setInvoiceTypeName] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Invoice>({
        id: 0,
        businessId: 0,
        categoryId: 1,
        invoiceType: "",
        invoiceRefId: 0,
        partyId: 0,
        date: "",
        note: "",
        items: [],
        currency: "AED",
        totalAmount: 0,
        isVat: false,
        isFullPaid: false,
        bankId: 0,
        vatPercentage: 0,
        discount: 0,
        grandTotal: 0,
        paidTotal: null,
        createdBy: 0,
        updatedBy: 0,
        system: 2
    });

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser?.user?.id)));
    const invoice = useSelector(selectInvoiceById);
    const matchingParties = useSelector(selectAllParties);
    const categories = useSelector(selectAllCategory);
    const invoices = useSelector(selectAllInvoice);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), invoiceTypeName ?? ''));
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));
    const itemData = useSelector(selectAllItemByBusiness(user?.business?.id || 0));
    const status = useSelector(selectInvoiceStatus);

    const [currentItem, setCurrentItem] = useState<Item>({
        itemId: 0,
        containerId: null,
        containerNo: null,
        name: "",
        price: 0,
        vatPercentage: 0,
        quantity: 0,
        subTotal: 0,
        warehouseId: null,
        warehouseName: '',
        itemGrandTotal: 0,
        system: 1,
        itemVat: 0
    });

    useEffect(() => {
        if ( matchingParties.length === 0) dispatch(fetchParty({ type: "all" }));
        dispatch(fetchAllCategory());
        dispatch(fetchAllItem());
        dispatch(fetchAll());
        dispatch(fetchAllStatus());
        dispatch(fetchAllUnit());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllAccount());
        if (id) dispatch(fetchById(Number(id)));
    }, [dispatch, id]);

    useEffect(() => {
        if (user?.business?.id && invoice) {
            setFormData({
                id: invoice.id,
                businessId: user.business.id,
                categoryId: invoice.categoryId,
                invoiceType: invoice.invoiceType,
                invoiceRefId: invoice.invoiceRefId,
                partyId: invoice.partyId,
                date: invoice.date,
                note: invoice.note,
                items: invoice.items,
                currency: invoice.currency,
                totalAmount: invoice.totalAmount,
                isVat: invoice.isVat,
                isFullPaid: invoice.isFullPaid,
                bankId: invoice.bankId,
                vatPercentage: invoice.vatPercentage,
                discount: invoice.discount,
                grandTotal: invoice.grandTotal,
                vatAmount: invoice.vatAmount,
                paidTotal: invoice.paidTotal,
                createdBy: invoice.createdBy,
                updatedBy: user.id,
                system: 1
            });

            const purchaseTypes = ["purchase", "fix_purchase", "unfix_purchase", "wholesale_purchase"];
            const invoicetype = purchaseTypes.includes(invoice.invoiceType ?? "") ? "purchase" : "sale";

            setInvoiceTypeName(invoicetype);
        }

    }, [user, invoice]);

    const categoryItem = useSelector(selectCategoryById(Number(formData.categoryId)));
    const containers = useSelector(selectAllContainer);
    const warehouses = useSelector(selectAllWarehouse);
    const paymentAccounts = useSelector(selectAllAccount);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
        }));
    };

    const handleCurrentItemChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentItem((prev) => ({
        ...prev,
        [name]: name === "price" || name === "quantity" ? Number(value) : value,
        }));
    };

    const calculateTotals = (items: Item[], isVat: boolean, discount: number) => {
            
        const updatedItems = items.map(item => {
            const getItem = itemData.find(i => i.id === item.itemId);

            const subTotal = (item.price ?? 0) * (item.quantity ?? 0);
            const vatAmount = isVat === true ? (subTotal * Number(getItem?.vatPercentage)) / 100 : 0;

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
        const discountedTotal = Math.max(0, totalGrandTotal - discount);

        return { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal, discountedTotal };
    };
    
    const addItem = () => {
        if (
            !currentItem.itemId ||
            (currentItem.price ?? 0) <= 0 ||
            (currentItem.quantity ?? 0) <= 0
        ) {
            toast.error("Please fill all item fields properly");
            return;
        }

        const newItems = [...formData.items, { ...currentItem, uniqueId: Date.now() }];
        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(newItems, formData.isVat ?? false, formData.discount ?? 0);

        setFormData(prev => ({
            ...prev,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
        }));

        setCurrentItem({
            itemId: 0,
            containerId: null,
            containerNo: null,
            uniqueId: Date.now(),
            name: '',
            price: 0,
            quantity: 0,
            vatPercentage: 0,
            unit: '',
            subTotal: 0,
            warehouseId: null,
            warehouseName: "",
            itemGrandTotal: 0,
            system: 1,
            itemVat: 0
        });
    };

    const removeItem = (item: Item) => {
        const newItems = formData.items.filter(i => !(
            (item.uniqueId && i.uniqueId === item.uniqueId) ||
            (
                i.containerId === item.containerId &&
                i.quantity === item.quantity &&
                i.unit === item.unit &&
                i.warehouseId === item.warehouseId
            )
        ));

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
        const { updatedItems, totalSubTotal, totalVatTotal, totalGrandTotal } = calculateTotals(formData.items, checked, formData.discount ?? 0);
        setFormData(prev => ({
            ...prev,
            isVat: checked,
            items: updatedItems,
            totalAmount: totalSubTotal,
            grandTotal: totalGrandTotal,
            vatAmount: totalVatTotal,
            vatPercentage: totalVatTotal > 0 ? user?.business?.vatPercentage : 0,
            paidTotal: null,
            isFullPaid: false
        }));
    };

    const handleFullPaidChange = (isfullPaid: boolean) => {
        
        setFormData(prev => ({
            ...prev,
            paidTotal : isfullPaid ? formData.grandTotal : null,
            isFullPaid : isfullPaid
        }));
        
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // start loading
        try {
            console.log("formData: ", formData);
            await dispatch(update(formData));
            toast.success("Invoice updated successfully!");
            const categoryId = 0;
            const saleTypes = ["sale", "fix_sale", "unfix_sale", "wholesale_sale"];
            const invoiceType = saleTypes.includes(formData.invoiceType ?? '') ? "sale" : "purchase";
            dispatch(fetchAllInvoicePagination({ page: 1, limit: 10, type: invoiceType }));
            navigate(`/invoice/${invoiceType}/${categoryId}/list`);
        } catch (err) {
            toast.error("Failed to update invoice.");
        } finally {
            setLoading(false); // stop loading
        }
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
    <div>
      <PageMeta title={`${formData.invoiceType ? formData.invoiceType.charAt(0).toUpperCase() + formData.invoiceType.slice(1).toLowerCase() : ''} Update`} description="Edit Invoice" />
      <PageBreadcrumb pageTitle={`${formData.invoiceType ? formData.invoiceType.charAt(0).toUpperCase() + formData.invoiceType.slice(1).toLowerCase() : ''} Update`} />
      {/* Print Button */}
           

      <ComponentCard title="Edit Invoice">
        {status === 'loading' && matchingParties.length === 0 ? (
            <div className="flex justify-center py-10">
                <p className="text-gray-500 text-lg font-medium animate-pulse">
                Loading data...
                </p>
            </div>
        ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <Label>Select Category</Label>
                    <Select
                        options={categories.map((c) => ({
                            label: c.name,
                            value: c.id,
                        }))}
                        placeholder="Select category"
                        value={
                            categories
                            .filter((c) => c.id === formData.categoryId)
                            .map((c) => ({ label: c.name, value: c.id }))[0] || null
                        }
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                categoryId: selectedOption?.value ?? 0,
                            }))
                        }
                        isClearable
                        styles={selectStyles}
                        classNamePrefix="react-select"
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
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.value}
                        styles={selectStyles}
                        classNamePrefix="react-select"
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
                    />

                    {/* <AsyncSelect
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
                                setFormData((prev) => ({ ...prev, partyId: 0 }));
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
                    /> */}
                    
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
                    />
                </div>

                {/* isVat */}
                { formData.invoiceType !== "clearance_bill" && (
                <div className="flex flex-col items-center text-center">
                    <Label>Select Vat (if have)</Label>
                    <Checkbox
                        key={formData.id}
                        id={`is-vat-check`}
                        label={`Is Vated`}
                        checked={!!formData.isVat}
                        onChange={handleVatChange}
                    />
                </div>
                )}

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
            </div>

            {/* Add Item Section */}
            <h5>Add Item</h5>
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                    <div>
                        <Label>Search Item Name</Label>
                        <Select
                            options={
                                categoryItem?.items?.map((i) => ({
                                    label: i.name,
                                    value: i.id,
                                    unit: i.unit,
                                    itemVat: i.vatPercentage
                                })) || []
                            }
                            placeholder="Select item"
                            value={
                                categoryItem?.items
                                ?.filter((i) => i.id === currentItem.itemId)
                                .map((i) => ({ label: i.name, value: i.id, unit: i.unit, itemVat: i.vatPercentage }))[0] || null
                            }
                            onChange={(selectedOption) =>
                                setCurrentItem((prev) => ({
                                    ...prev,
                                    itemId: selectedOption?.value,
                                    name: selectedOption?.label ?? '',
                                    unit: selectedOption?.unit ?? '',
                                    vatPercentage: selectedOption?.itemVat ?? 0
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
                                containers?.map((i) => ({
                                    label: i.containerNo,
                                    value: i.id
                                })) || []
                                }
                                placeholder="Select container"
                                value={
                                containers
                                    ?.map((w) => ({ label: w.containerNo, value: w.id }))
                                    .find((option) => option.value === currentItem.containerId) || null
                                }
                                onChange={(selectedOption) =>
                                setCurrentItem((prev) => ({
                                    ...prev,
                                    containerId: selectedOption ? Number(selectedOption.value) : null,
                                    containerNo: selectedOption?.label ?? null, 
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
                            step={0.01}
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
                        <Button type="button" onClick={addItem}>
                            Add Item
                        </Button>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <Table>
                <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                    <TableRow>
                    <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                    <TableCell isHeader className="text-center px-4 py-2">Item</TableCell>
                    { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                        <TableCell isHeader className="text-center px-4 py-2">Container</TableCell>
                    )}
                    <TableCell isHeader className="text-center px-4 py-2">Quantity</TableCell>
                    <TableCell isHeader className="text-center px-4 py-2">Unit</TableCell>
                    <TableCell isHeader className="text-center px-4 py-2">Price</TableCell>
                    <TableCell isHeader className="text-center px-4 py-2">Sub-Total</TableCell>
                    { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                        <TableCell isHeader className="text-center px-4 py-2">Warehouse</TableCell>
                    )}
                    <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                    </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {formData.items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                        No items added yet.
                        </TableCell>
                    </TableRow>
                    ) : (
                    formData.items.map((item, index) => (
                        <TableRow key={`${item.itemId}-${index}`}>
                        <TableCell className="text-center px-4 py-2">{index + 1}</TableCell>
                        <TableCell className="text-center px-4 py-2">{item.name}</TableCell>
                        { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                            <TableCell className="text-center px-4 py-2">{item?.containerNo ?? item?.container?.containerNo}</TableCell>
                        )}
                        <TableCell className="text-center px-4 py-2">{item.quantity}</TableCell>
                        <TableCell className="text-center px-4 py-2">{item.unit?.toUpperCase()}</TableCell>
                        <TableCell className="text-center px-4 py-2">{item?.price?.toFixed(2)}</TableCell>
                        <TableCell className="text-center px-4 py-2">{((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</TableCell>
                        { !categories.find((c) => ["currency", "gold"].includes(c.name.toLowerCase()) ) && formData.invoiceType === "sale" && (
                            <TableCell className="text-center px-4 py-2">{item?.warehouseName ?? item?.warehouse?.name}</TableCell>
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-20">
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

                {/* Total Amount */}
                {/* <div>
                <Label>Discount</Label>
                <Input
                    type="number"
                    name="discount"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData((prev) => ({
                        ...prev!,
                        discount: value
                    }));
                    }}
                />
                </div> */}

                {/* Total Amount */}
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

                { formData.invoiceType === "sale" && (
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

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
            </form>
        )}
      </ComponentCard>
    </div>
  );
}
