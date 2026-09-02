
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button.tsx";

import Select from "react-select";
import { toast } from "react-toastify";

import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";

import { OptionStringType, MovementTypeOptions, selectStyles } from "../../types.ts";
import { Stock } from "../../stock/features/stockTypes.ts";

import { create, update, fetchById } from "../../stock/features/stockThunks.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { fetchAllWarehouse } from "../../warehouse/features/warehouseThunks.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";

import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { selectAllItem } from "../../item/features/itemSelectors.ts";
import { selectAllWarehouse } from "../../warehouse/features/warehouseSelectors.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
import { selectStockById } from "../../stock/features/stockSelectors";
import { selectAllParties } from "../../party/features/partySelectors.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";

interface CurrencyPaymentProps {
  editingStockId: number;
  stockPartyId: number;
}

export default function VoucherStock({ editingStockId, stockPartyId }: CurrencyPaymentProps) {
    console.log("editingStockId- ", editingStockId);

    const dispatch = useDispatch<AppDispatch>();

    const authUser = useSelector(selectAuth);
    const user = useSelector(selectUserById(Number(authUser.user?.id)));
    // console.log("StockVoucher authUser: ", authUser);
    // console.log("StockVoucher user: ", user);
    const stockType = "paymentAccount";
    const items = useSelector(selectAllItem);
    const invoices = useSelector(selectAllInvoice);
    const warehouses = useSelector(selectAllWarehouse);
    const banks = useSelector(selectAllAccount);
    const selectedStock = useSelector(selectStockById(Number(editingStockId)));
    //console.log("banks- ", selectedStock);
    const matchingParties = useSelector(selectAllParties);
    const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        dispatch(fetchAllInvoice());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllAccount());
        dispatch(fetchAllItem());
        dispatch(fetchParty({ type: "all" }));
        dispatch(fetchAllUnit());

        if (editingStockId) {
            dispatch(fetchById(editingStockId));
        }
    }, [editingStockId, dispatch]);


    const [formData, setFormData] = useState<Stock>({
        businessId: 0,
        date: '',
        invoiceType: undefined,        
        invoiceId: 0,
        categoryId: 0,
        partyId: 0,
        itemId: 0,
        movementType: '',
        warehouseId: undefined,
        bankId: undefined,
        quantity: 0,
        unit: '',
        createdBy: 0,
    });

    useEffect(() => {
        if (user?.business?.id) {
          setFormData((prev) => ({
            ...prev,
            businessId: user?.business?.id,
            createdBy: user?.id
          }));
        }
    }, [user]);

    useEffect(() => {

        if (!selectedStock) return;

        setFormData({
            businessId: user?.business?.id,
            date: selectedStock.date,
            invoiceType: selectedStock.invoiceType,        
            invoiceId: selectedStock.invoiceId,
            categoryId: selectedStock.categoryId,
            partyId: selectedStock.partyId,
            itemId: selectedStock.itemId,
            movementType: selectedStock.movementType,
            warehouseId: selectedStock.warehouseId,
            bankId: selectedStock.bankId,
            quantity: selectedStock.quantity ?? 0,
            unit: selectedStock.unit ?? '',
            createdBy: selectedStock.createdBy,
            updatedBy: user?.id
        });
    }, [selectedStock, user]);


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
        }));
    };


    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.invoiceId) newErrors.invoiceId = "Invoice Ref is required!";
        if (!formData.partyId) newErrors.partyId = "Party is required!";
        if (!formData.date.trim()) newErrors.date = "Date is required!";
        if (!formData.movementType.trim()) newErrors.movementType = "Stock type is required!";
        if (!formData.itemId) newErrors.itemId = "Item is required!";
        if (!formData.bankId) newErrors.bankId = "Stock Account is required!";
        if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity is required!";
        if (!formData.unit) newErrors.unit = "Unit is required!";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        if (editingStockId) {
            const updatedForm: Stock = {
                ...formData,
                id: selectedStock?.id,
                updatedBy: user?.id,
                createdBy: selectedStock?.createdBy,
            };
    
            console.log("Updated formData: ", updatedForm);
    
            await dispatch(update(updatedForm));
            toast.success("Invoice updated successfully!");
        }else{
    
            const createdForm: Stock = {
                ...formData,
                createdBy: user?.id,
            };
    
            console.log("Created formData: ", createdForm);
    
            await dispatch(create(createdForm));
            toast.success("Stock created successfully!");
        }
        window.location.reload();
       
        
    };

  return (
    <div className="flex">
      <div className="w-full">
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                

                {/* Invoice Type */}
                <div>
                    <Label>Invoice Ref</Label>
                    <Select
                        options={invoices.map((i) => ({
                            label: `${String(i.invoiceNo)}`,
                            value: Number(i.id),
                            partyId: Number(i.partyId),
                            invoiceType: i.invoiceType,
                            categoryId: i.categoryId
                        }))}
                        placeholder="Select invoice type"
                        value={
                            invoices
                                .filter((i) => i.id === formData.invoiceId)
                                .map((i) => ({ label: `${String(i.invoiceNo)}`, partyId: i.partyId, value: i.id, invoiceType: i.invoiceType, categoryId: i.categoryId }))[0] || null
                        }
                        onChange={(selectedOption) => {
                            setFormData(prev => ({
                                ...prev,
                                invoiceId: selectedOption!.value ?? 0,
                                partyId: Number(selectedOption?.partyId),
                                invoiceType: selectedOption?.invoiceType,
                                categoryId: Number(selectedOption?.categoryId)
                            }));
                        }}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                    {errors.invoiceId && <p className="text-red-500 text-sm">{errors.invoiceId}</p>}
                </div>
            
                {!stockPartyId && (
                <div>
                    <Label>Party</Label>
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
                    {errors.partyId && <p className="text-red-500 text-sm">{errors.partyId}</p>}
                </div>
                )}

                {/* Date */}
                <div>
                    <DatePicker
                        id="date-picker"
                        label="Date"
                        placeholder="Select a date"
                        defaultDate={formData.date}
                        onChange={(dates, currentDateString) => {
                            console.log({ dates, currentDateString });
                            setFormData((prev) => ({
                                ...prev!,
                                date: currentDateString, 
                            }));
                        }}
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>

                {/* Invoice Type */}
                <div>
                    <Label>Stock Type</Label>
                    <Select<OptionStringType>
                        options={MovementTypeOptions}
                        placeholder="Select stock type"
                        value={MovementTypeOptions.find(option => option.value === formData.movementType)}
                        onChange={(selectedOption) => {
                            setFormData(prev => ({
                                ...prev,
                                movementType: selectedOption!.value,
                            }));
                        }}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                    {errors.movementType && <p className="text-red-500 text-sm">{errors.movementType}</p>}
                </div>

                <div>
                    <Label>Search Item Name</Label>
                    <Select
                        options={
                        items?.map(i => ({
                            label: i.name,
                            value: i.id
                        })) || []
                        }
                        placeholder="Select item"
                        value={
                        items
                            ?.filter(i => i.id === formData.itemId)
                            .map(i => ({ label: i.name, value: i.id }))[0] || null
                        }
                        onChange={(selectedOption) =>
                        setFormData((prev) => ({
                            ...prev,
                            itemId: Number(selectedOption?.value) || 0,
                        }))
                        }
                        isClearable
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                    {errors.itemId && <p className="text-red-500 text-sm">{errors.itemId}</p>}
                </div>

                {/* Paid Amount */}
                <div>
                    <Label>Quantity</Label>
                    <Input
                        type="text"
                        name="quantity"
                        placeholder="0"
                        value={formData.quantity > 0 ? formData.quantity : ''}
                        onChange={handleChange}
                        min="0"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
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
                        value={
                            UnitOptions
                            ?.filter((w) => w.name === formData.unit)
                            .map((w) => ({ label: w.name, value: w.name }))[0] || null
                        }
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                unit: selectedOption?.value,
                            }))
                        }
                        isClearable
                        styles={selectStyles}
                        classNamePrefix="react-select"
                    />
                    {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
                </div>

                { stockType === "paymentAccount" ? (
                    <div>
                        <Label>Stock Account</Label>
                        <Select
                            options={
                            banks
                                .map((b) => ({
                                    label: `${b.accountName}`,
                                    value: b.id,
                                })) || []
                            }
                            placeholder="Select stock account"
                            value={
                                banks
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
                        {errors.bankId && <p className="text-red-500 text-sm">{errors.bankId}</p>}
                    </div>
                ): (
                    <div>
                        <Label>Stock Location</Label>
                        <Select
                            options={
                            warehouses
                                .map((w) => ({
                                    label: `${w.name}`,
                                    value: Number(w.id),
                                })) || []
                            }
                            placeholder="Select warehouse"
                            value={
                                warehouses
                                ?.filter((w) => w.id === formData.warehouseId)
                                .map((w) => ({ label: w.name, value: w.id }))[0] || null
                            }
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    warehouseId: selectedOption?.value ?? 0,
                                }))
                            }
                            isClearable
                            styles={selectStyles}
                            classNamePrefix="react-select"
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" variant="success">
                Submit
                </Button>
            </div>
            </form>
      </div>
    </div>
  );
}

