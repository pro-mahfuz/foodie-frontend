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
} from "../../../components/ui/table/index.tsx";
import Checkbox from "../../../components/form/input/Checkbox.tsx";
import AsyncSelect from "react-select/async";

import { OptionStringType, selectStyles, CurrencyOptions } from "../../types.ts";
import { Invoice } from "../../invoice/features/invoiceTypes";
import { Item } from "../../item/features/itemTypes.ts";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { create } from "../../invoice/features/invoiceThunks";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { AppDispatch } from "../../../store/store";
import { selectAllParties } from "../../party/features/partySelectors";
import { selectAllCategory, selectCategoryById } from "../../category/features/categorySelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectAllContainer } from "../../container/features/containerSelectors";
import { fetchAll } from "../../container/features/containerThunks.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

export default function BillCreateForm() {
    const { invoiceType } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        dispatch(fetchParty({ type: "all" }));
        dispatch(fetchAllCategory());
        dispatch(fetchAll());
        dispatch(fetchAllInvoice());
        dispatch(fetchAllUnit());
        dispatch(fetchAllStatus());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllAccount());
    }, [dispatch]);

    const matchingParties = useSelector(selectAllParties);
    const categories = useSelector(selectAllCategory);
    const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), invoiceType ?? ''));
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));
    const warehouses = useSelector(selectAllWarehouse);
    const paymentAccounts = useSelector(selectAllAccount);
    const containers = useSelector(selectAllContainer);
    
    const [formData, setFormData] = useState<Invoice>({
        businessId: 0,
        categoryId: 3,
        invoiceType: invoiceType,
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
        system: 1,
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

        setFormData((prev) => ({
            ...prev,
            invoiceType: invoiceType,
        }));
    }, [user, invoiceType]);

    useEffect(() => {
        dispatch(fetchParty({ type: "all" }));
    }, [filterText]);

    const categoryItem = useSelector(selectCategoryById(Number(formData.categoryId)));

    // Local state for current item inputs
    const [currentItem, setCurrentItem] = useState<Item>({
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
        system: 1,
        vatPercentage: 0
    });


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
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
            console.log("Invoice FormData: ", formData);
            await dispatch(create(formData));
            toast.success("Invoice created successfully!");
            navigate(`/bill/list`);
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
            itemId: 0,
            containerId: 0,
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
            system: 1,
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
        console.log("full paid checked: ", formData.paidTotal);
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
        <div>
        <PageMeta title={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} Create`} description="Form to create a new invoice" />
        <PageBreadcrumb pageTitle={`${invoiceType ? invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1).toLowerCase() : ''} Create`} />

        <div className="mb-4 flex justify-start">
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-400 text-white px-2 py-1 rounded-full hover:bg-red-700 mr-4"
                >
                    Back
                </button>

                <button
                    onClick={() => {navigate(`/bill/list`)}}
                    className="bg-fuchsia-400 text-white px-2 py-1 rounded-full hover:bg-fuchsia-700 mr-4"
                >
                    Bill List
                </button>
                
            </div>
        </div>
        <ComponentCard title="Fill up all fields to create a new invoice">
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Category */}
                    <div>
                        <Label>Select Category</Label>
                        <Select
                            options={categories.map((c) => ({
                                label: c.name,
                                value: c.id,
                            }))}
                            placeholder="Search and select category"
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
                            required
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

                    {/* Search Party */}
                    <div>
                        <Label>Select Party</Label>
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
                                    })) || []
                                }
                                placeholder="Select item"
                                value={
                                    categoryItem?.items
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
                                
                                    onChange={(selectedOption) =>
                                        setCurrentItem((prev) => ({
                                            ...prev,
                                            containerId: selectedOption?.value ?? 0,
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
                                onChange={handleCurrentItemChange}
                                placeholder="0"
                                min="0"
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
                                placeholder="Select unit"
                               
                                onChange={(selectedOption) =>
                                    setCurrentItem((prev) => ({
                                        ...prev,
                                        unit: selectedOption?.value,
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
                                onChange={handleCurrentItemChange}
                                placeholder="0.00"
                                min="0"
                                step={0.01}
                            />
                        </div>

                        { formData.invoiceType === "sale" && (
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
                                    placeholder="Select warehouse"
                                    onChange={(selectedOption) =>
                                        setCurrentItem((prev) => ({
                                            ...prev,
                                            warehouseId: selectedOption?.value ?? null,
                                            warehouseName: selectedOption?.label
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
                        <TableCell isHeader className="text-center px-4 py-2">Quantity</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Unit</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Price</TableCell>
                        <TableCell isHeader className="text-center px-4 py-2">Sub-Total</TableCell>
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
                        <TableRow key={index+1}>
                            <TableCell className="text-center px-4 py-2">{index + 1}</TableCell>
                            <TableCell className="text-center px-4 py-2">{item.name}</TableCell>
                            <TableCell className="text-center px-4 py-2">{item.quantity}</TableCell>
                            <TableCell className="text-center px-4 py-2">{item.unit}</TableCell>
                            <TableCell className="text-center px-4 py-2">{item?.price?.toFixed(2)}</TableCell>
                            <TableCell className="text-center px-4 py-2">{((item?.price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}</TableCell>
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

                <div className="flex justify-end">
                    <Button type="submit" variant="success">
                    Submit
                    </Button>
                </div>
            </form>
        </ComponentCard>
        </div>
    );
}
