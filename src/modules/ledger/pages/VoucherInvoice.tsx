import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Select from "react-select";
import { toast } from "react-toastify";

import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

import { OptionStringType, CurrencyOptions, selectStyles } from "../../types.ts";
import { Invoice } from "../../invoice/features/invoiceTypes.ts";
import { Item } from "../../item/features/itemTypes.ts";
import { AppDispatch } from "../../../store/store.ts";
import { create, fetchById, update } from "../../invoice/features/invoiceThunks.ts";
import { fetchAllItem } from "../../item/features/itemThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { selectAllParties } from "../../party/features/partySelectors.ts";
import { selectInvoiceById } from "../../invoice/features/invoiceSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";
import { selectCategoryById } from "../../category/features/categorySelectors";
import { fetchAllCategory } from "../../category/features/categoryThunks.ts";
import { selectAllStatusByType } from "../../status/features/statusSelectors.ts";
import { selectAllUnitByBusiness } from "../../unit/features/unitSelectors.ts";
import { fetchAllUnit } from "../../unit/features/unitThunks.ts";
import { fetchAllStatus } from "../../status/features/statusThunks.ts";

interface CurrencyPurchaseProps {
  editingLedgerId: number;
  ledgerPartyId: number;
}

export default function VoucherInvoice({ editingLedgerId, ledgerPartyId }: CurrencyPurchaseProps) {

  // const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));

  useEffect(() => {
    dispatch(fetchAllCategory());
    dispatch(fetchAllUnit());
    dispatch(fetchAllStatus());
  }, [dispatch]);

  const [form, setForm] = useState<Invoice>({
    businessId: 0,
    categoryId: null,
    invoiceType: "",
    partyId: 0,
    date: "",
    note: "",
    items: [],
    currency: "",
    totalAmount: 0,
    isVat: false,
    vatPercentage: 0,
    discount: 0,
    grandTotal: 0,
    createdBy: 0,
    system: 1
  });

  const matchingParties = useSelector(selectAllParties);
  const categoryItem = useSelector(selectCategoryById(Number(form.categoryId)));
  const selectedInvoice = useSelector(selectInvoiceById);
  const InvoiceTypeOptions = useSelector(selectAllStatusByType(Number(user?.business?.id), 'invoice'));
  const UnitOptions = useSelector(selectAllUnitByBusiness(Number(user?.business?.id)));

  useEffect(() => {
    if (user?.business?.id) {
      setForm((prev) => ({
        ...prev,
        businessId: user?.business?.id,
      }));
    }

    if (user?.business?.id) {
      setForm((prev) => ({
        ...prev,
        partyId: ledgerPartyId
      }));
    }
  }, [user, ledgerPartyId]);

  const [currentItem, setCurrentItem] = useState<Item>({
    id: 0,
    itemId: 0,
    name: '',
    price: 0,
    quantity: 0,
    subTotal: 0,
    system: 1,
    itemVat: 0,
    vatPercentage: 0
  });

  useEffect(() => {
    dispatch(fetchParty({ type: "all" }));
    dispatch(fetchAllItem());
    if (editingLedgerId) {
      dispatch(fetchById(editingLedgerId));
    }
  }, [editingLedgerId, dispatch]);

  useEffect(() => {
    if (!selectedInvoice) return;

    setForm({
      businessId: user?.business?.id,
      categoryId: selectedInvoice.categoryId ?? 1,
      invoiceType: selectedInvoice.invoiceType ?? "",
      partyId: selectedInvoice.partyId ?? 0,
      date: selectedInvoice.date,
      note: selectedInvoice.note ?? '',
      items: [],
      currency: selectedInvoice.currency,
      totalAmount: selectedInvoice.totalAmount ?? 0,

      isVat: false,
      vatPercentage: selectedInvoice.vatPercentage,
      discount: selectedInvoice.discount,
      grandTotal: selectedInvoice.grandTotal,
      system: 1
    });

    if (selectedInvoice.items && selectedInvoice.items.length > 0) {
      const firstItem = selectedInvoice.items[0];
      setCurrentItem({
        id: firstItem.id ?? 0,
        itemId: firstItem.itemId ?? 0,
        name: firstItem.name ?? '',
        price: firstItem.price ?? 0,
        quantity: firstItem.quantity ?? 0,
        unit: firstItem.unit ?? '',
        subTotal: Math.round(firstItem.subTotal ?? 0) ?? 0,
        system: 1,
        itemVat: firstItem.itemVat,
        vatPercentage: firstItem.vatPercentage
      });
    } else {
      setCurrentItem({
        id: 0,
        itemId: 0,
        name: '',
        price: 0,
        quantity: 0,
        unit: '',
        subTotal: 0,
        system: 1,
        itemVat: 0,
        vatPercentage: 0
      });
    }
  }, [selectedInvoice, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!form) return;

    setForm((prev) => ({
      ...prev!,
      [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleCurrentItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem((prev: Item) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!form.partyId) newErrors.partyId = "Party is required!";
    if (!form.date.trim()) newErrors.date = "Date is required!";
    if (!form.invoiceType?.trim()) newErrors.invoiceType = "Invoice type is required!";
    if (!form.currency) newErrors.currency = "Currency is required";
    if (!currentItem.itemId) newErrors.itemId = "Item is required!";
    if (!currentItem.price) newErrors.price = "Rate is required!";
    if (!currentItem.quantity) newErrors.quantity = "Quantity is required!";
    if (!currentItem.unit) newErrors.unit = "Unit is required!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form) return;

    const newItem: Item = {
      ...currentItem,
      subTotal: (currentItem.price ?? 0) * (currentItem.quantity ?? 0),
    };

    const updatedItems = [...form.items, newItem];

    if (editingLedgerId) {
      const total = updatedItems.reduce( (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0 );
      const discount = Number(form.discount) || 0;
      const discountedTotal = Math.max(0, total - discount);
      const vatAmount = form.isVat === true ? discountedTotal * (Number(user?.business?.vatPercentage) / 100) : 0;
      const grandTotal = discountedTotal + vatAmount;

      const updatedForm: Invoice = {
        ...form,
        id: selectedInvoice?.id,
        items: updatedItems,
        totalAmount: total,
        grandTotal: Math.round(grandTotal),
        vatPercentage: form.isVat === true ? user?.business?.vatPercentage ?? 0 : 0,
        updatedBy: user?.id,
      };

      await dispatch(update(updatedForm));
      toast.success("Invoice updated successfully!");
    }else{

      if (!validateForm()) {
        toast.error("Please fix the errors in the form.");
        return;
      }

      const total = updatedItems.reduce( (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0 );
      const discount = Number(form.discount) || 0;
      const discountedTotal = Math.max(0, total - discount);
      const vatAmount = form.isVat === true ? discountedTotal * (Number(user?.business?.vatPercentage) / 100) : 0;
      const grandTotal = discountedTotal + vatAmount;

      const createdForm: Invoice = {
        ...form,
        items: updatedItems,
        createdBy: user?.id,
        totalAmount: total,
        grandTotal: grandTotal,
        vatPercentage: form.isVat === true ? user?.business?.vatPercentage ?? 0 : 0,
      };

      await dispatch(create(createdForm));
      toast.success("Invoice created successfully!");
    }
    window.location.reload();
    //navigate("/currency/ledger");
  };

  return (
    <div className="flex">
      <div className="w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {!ledgerPartyId && (
              <div>
                <Label>Party</Label>
                <Select
                  options={matchingParties.map((p) => ({
                    label: p.name,
                    value: p.id,
                  }))}
                  placeholder="Select party"
                  value={
                    form
                      ? matchingParties
                          .filter((p) => p.id === form.partyId)
                          .map((p) => ({ label: p.name, value: p.id }))[0] || null
                      : null
                  }
                  onChange={(selectedOption) =>
                    setForm((prev) => ({
                      ...prev!,
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

            

            <div>
              <DatePicker
                id="date-picker"
                label="Date"
                placeholder="Select a date"
                defaultDate={form.date}
                onChange={(dates, currentDateString) => {
                  // Handle your logic
                  console.log({ dates, currentDateString });
                  setForm((prev) => ({
                    ...prev!,
                    date: currentDateString,
                  }))
                }}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>

            <div>
              <Label>Invoice Type</Label>
              <Select
                options={InvoiceTypeOptions}
                placeholder="Select invoice type"
                value={
                  form
                    ? InvoiceTypeOptions.find((option) => option.value === form.invoiceType)
                    : null
                }
                onChange={(selectedOption) => {
                  setForm((prev) => ({
                    ...prev!,
                    invoiceType: selectedOption!.value,
                  }));
                }}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
              {errors.invoiceType && <p className="text-red-500 text-sm">{errors.invoiceType}</p>}
            </div>
            
            <div>
              <Label>Search Item Name</Label>
              <Select
                options={categoryItem?.items?.map((i) => ({
                  label: i.name,
                  value: i.id,
                }))}
                placeholder="Select item"
                value={
                  categoryItem?.items
                    ?.filter((i) => i.id === currentItem.itemId)
                    .map((i) => ({ label: i.name, value: i.id }))[0] || null
                }
                onChange={(selectedOption) =>
                  setCurrentItem((prev: Item) => ({
                    ...prev,
                    itemId: selectedOption?.value ?? 0,
                    name: selectedOption?.label ?? "",
                  }))
                }
                isClearable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
              {errors.itemId && <p className="text-red-500 text-sm">{errors.itemId}</p>}
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                name="quantity"
                placeholder="0"
                value={Number(currentItem.quantity) > 0 ? currentItem.quantity : '' }
                onChange={handleCurrentItemChange}
                required
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
                      ?.filter((w) => w.name === currentItem.unit)
                      .map((w) => ({ label: w.name, value: w.name }))[0] || null
                  }
                  onChange={(selectedOption) =>
                      setCurrentItem((prev) => ({
                          ...prev,
                          unit: selectedOption?.value ?? '',
                      }))
                  }
                  isClearable
                  styles={selectStyles}
                  classNamePrefix="react-select"
              />
              {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
            </div>
          </div>
          

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
            
            <div>
              <Label>Payment Currency</Label>
              <Select<OptionStringType>
                options={CurrencyOptions}
                placeholder="Select currency"
                value={
                  form
                    ? CurrencyOptions.find((option) => option.value === form.currency)
                    : null
                }
                onChange={(selectedOption) => {
                  setForm((prev) => ({
                    ...prev!,
                    currency: selectedOption!.value,
                  }));
                }}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
              {errors.currency && <p className="text-red-500 text-sm">{errors.currency}</p>}
            </div>
          
            <div>
              <Label>Rate</Label>
              <Input
                type="number"
                step={1}
                name="price"
                placeholder="0"
                value={Number(currentItem.price) > 0 ? currentItem.price : ''}
                onChange={handleCurrentItemChange}
                required
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            

            <div>
              <Label>Total Amount</Label>
              <Input
                type="text"
                name="subTotal"
                value={(currentItem.quantity ?? 0) * (currentItem.price ?? 0)}
                readonly
              />
            </div>

            <div className="col-span-3">
              <Label>Description / Note</Label>
              <Input
                type="text"
                name="note"
                value={form?.note ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="rounded-full bg-sky-500 text-white px-4 py-2 hover:bg-sky-700"
            >
              Submit Purchase/Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
