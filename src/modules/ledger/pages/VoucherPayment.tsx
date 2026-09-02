
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";

import Select from "react-select";
import { toast } from "react-toastify";

import { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchAllInvoice } from "../../invoice/features/invoiceThunks.ts";
import { fetchParty } from "../../party/features/partyThunks.ts";
import { create, update, fetchById } from "../../payment/features/paymentThunks.ts";
import { selectAllParties } from "../../party/features/partySelectors.ts";
import { selectPaymentById } from "../../payment/features/paymentSelectors.ts";
import { Payment, paymentOptions, OptionType } from "../../payment/features/paymentTypes.ts";
import { selectUserById } from "../../user/features/userSelectors.ts";
import { selectAuth } from "../../auth/features/authSelectors.ts";
import { selectAllInvoice } from "../../invoice/features/invoiceSelectors.ts";
import { CurrencyOptions, OptionStringType, selectStyles } from "../../types.ts";
import { fetchAllAccount } from "../../account/features/accountThunks.ts";
import { selectAllAccount } from "../../account/features/accountSelectors.ts";
// import { useNavigate } from "react-router-dom";

interface CurrencyPaymentProps {
  editingPaymentId: number;
  paymentPartyId: number;
}

export default function VoucherPayment({ editingPaymentId, paymentPartyId }: CurrencyPaymentProps) {
  console.log("editingPaymentId: ", editingPaymentId);
  // const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  // console.log("VoucherPayment authUser: ", authUser);
  // console.log("VoucherPayment user: ", user);

  const invoices = useSelector(selectAllInvoice);
 
  const matchingParties = useSelector(selectAllParties);
  const selectedPayment = useSelector(selectPaymentById(Number(editingPaymentId)));
  const paymentAccounts = useSelector(selectAllAccount);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState<Payment>({
    businessId: user?.business?.id,
    categoryId: 1,
    paymentType: "",
    invoiceId: 0,
    partyId: 0,
    paymentDate: '',
    note: "",
    amountPaid: 0,
    bankId: 0,
    paymentMethod: "",
    paymentDetails: '',
    currency: '',
    createdBy: 0,
    system: 1
  });

  useEffect(() => {
      dispatch(fetchAllInvoice());
      dispatch(fetchParty({ type: "all" }));
      dispatch(fetchAllAccount());
      if (editingPaymentId) {
        dispatch(fetchById(editingPaymentId));
      }
  }, [editingPaymentId, dispatch]); 

  useEffect(() => {
    if (user?.business?.id) {
      setForm((prev) => ({
        ...prev,
        businessId: user?.business?.id,
        createdBy: user?.id
      }));
    }

    if (user?.business?.id) {
      setForm((prev) => ({
        ...prev,
        partyId: paymentPartyId
      }));
    }
  }, [paymentPartyId, user]);

  useEffect(() => {
    // console.log("selectedPayment", selectedPayment);
    if (!selectedPayment) return;

    setForm({
      businessId: user?.business?.id ?? 0,
      categoryId: selectedPayment.categoryId ?? 1,
      paymentType: selectedPayment.paymentType ?? '',
      partyId: selectedPayment.partyId ?? 0,
      invoiceId: selectedPayment.invoiceId ?? 0,
      paymentDate: selectedPayment.paymentDate,
      note: selectedPayment.note ?? '',
      amountPaid: selectedPayment.amountPaid ?? 0,
      bankId: selectedPayment.bankId ?? 0,
      paymentMethod: selectedPayment.paymentMethod,
      paymentDetails: selectedPayment.paymentDetails,
      currency: selectedPayment.currency,
      createdBy: selectedPayment.createdBy,
      updatedBy: user?.id,
      system: 1
    });
  }, [selectedPayment, user]);

  const handlePaymentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!form) return;

    setForm((prev) => ({
      ...prev!,
      [name]: name === "partyId" || name === "categoryId" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.invoiceId) newErrors.invoiceId = "Invoice Ref is required!";
    if (!form.partyId) newErrors.partyId = "Party is required!";
    if (!form.paymentDate.trim()) newErrors.date = "Date is required!";
    if (!form.paymentType.trim()) newErrors.paymentType = "Payment type is required!";
    if (!form.currency) newErrors.currency = "Currency is required";
    if (!form.bankId) newErrors.bankId = "Payment Account is required!";
    if (!form.amountPaid || form.amountPaid <= 0) newErrors.amountPaid = "Amount Paid is required!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    if (!form) return;
    
    if (editingPaymentId) {
      const updatedForm: Payment = {
        ...form,
        id: selectedPayment?.id,
      };
      // console.log("Updated formData: ", updatedForm);
      await dispatch(update(updatedForm));
      toast.success("Payment updated successfully!");
    }else{
      //console.log("formData: ", form);
      await dispatch(create(form));
      toast.success("Payment created successfully!");
    }
    window.location.reload();
    //navigate("/currency/ledger");
  };

  return (
    <div className="flex">
      <div className="w-full">
        <form onSubmit={handlePaymentSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Invoice Ref</Label>
              <Select
                options={invoices.map((i) => ({
                    label: `${String(i.invoiceNo)}`,
                    value: Number(i.id),
                    partyId: Number(i.partyId)
                }))}
                placeholder="Select invoice type"
                value={
                  invoices
                      .filter((i) => i.id === form.invoiceId)
                      .map((i) => ({ label: `${String(i.invoiceNo)}`, partyId: i.partyId, value: i.id }))[0] || null
                }
                onChange={(selectedOption) => {
                    setForm(prev => ({
                        ...prev,
                        invoiceId: selectedOption!.value ?? 0,
                        partyId: Number(selectedOption?.partyId),
                    }));
                }}
                styles={selectStyles}
                classNamePrefix="react-select"
              />
              {errors.invoiceId && <p className="text-red-500 text-sm">{errors.invoiceId}</p>}
            </div>
            
            {!paymentPartyId && (
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
                          .filter((p) => p.id === form.partyId)
                          .map((p) => ({ label: p.name, value: p.id }))[0] || null
                  }
                  onChange={(selectedOption) =>
                      setForm((prev) => ({
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
            
            <div>
              <DatePicker
                id="date-picker"
                label="Date"
                placeholder="Select a date"
                defaultDate={form.paymentDate}
                onChange={(_dates, currentDateString) => {
                  // Handle your logic
                  // console.log({ dates, currentDateString });
                  setForm((prev) => ({
                    ...prev!,
                    paymentDate: currentDateString,
                  }))
                }}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>

            {/* <div>
              <Label>Date</Label>
              <Input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handlePaymentChange}
                  required
              />
            </div> */}

            {/* <div>
                <Label>Select Category</Label>
                <Select<OptionType>
                    options={categoryOptions}
                    placeholder="Select category"
                    value={categoryOptions.find(option => option.value === String(form.categoryId))}
                    onChange={(selectedOption) => {
                    setForm(prev => ({
                        ...prev,
                        categoryId: Number(selectedOption?.value ?? 0),
                    }));
                    }}
                    isClearable
                    styles={selectStyles}
                    classNamePrefix="react-select"
                />
            </div> */}

            <div>
              <Label>Payment Type</Label>
              <Select<OptionType>
                options={paymentOptions}
                placeholder="Select payment type"
                value={paymentOptions.find(option => option.value === form.paymentType)}
                onChange={(selectedOption) => {
                    setForm(prev => ({
                        ...prev,
                        paymentType: selectedOption?.value as "payment_in" | "payment_out",
                    }));
                }}
                isClearable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
              {errors.paymentType && <p className="text-red-500 text-sm">{errors.paymentType}</p>}
            </div>

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
              <Label>Payment Account</Label>
              <Select
                options={
                paymentAccounts
                    .map((b) => ({
                        label: `${b.accountName}`,
                        value: b.id,
                    })) || []
                }
                placeholder="Select payment account"
                value={
                    paymentAccounts
                    ?.filter((b) => b.id === form.bankId)
                    .map((b) => ({ label: b.accountName, value: b.id }))[0] || null
                }
                onChange={(selectedOption) =>
                    setForm((prev) => ({
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

            <div>
              <Label>Amount</Label>
              <Input
                type="text"
                name="amountPaid"
                placeholder="0"
                value={Number(form.amountPaid) > 0 ? form.amountPaid : ''}
                onChange={handlePaymentChange}
                required
              />
              {errors.amountPaid && <p className="text-red-500 text-sm">{errors.amountPaid}</p>}
            </div>

            <div className="col-span-2">
              <Label>Description / Note</Label>
              <Input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handlePaymentChange}
              />
            </div>

            

            {/* <div>
              <Label>Payment Method</Label>
              <Select<OptionType>
                options={paymentMethodOptions}
                placeholder="Select Payment Method Type"
                value={paymentMethodOptions.find(option => option.value === form.paymentMethod)}
                onChange={(selectedOption) => {
                    setForm(prev => ({
                        ...prev,
                        paymentMethod: selectedOption?.value as "cash" | "bank",
                    }));
                }}
                isClearable
                styles={selectStyles}
                classNamePrefix="react-select"
              />
            </div>

            <div className="col-span-2">
              <Label>Payment Details (If Bank Method)</Label>
              <Input
                  type="text"
                  name="paymentDetails"
                  value={form.paymentDetails}
                  onChange={handlePaymentChange}
              />
            </div> */}

          </div>

          <div className="flex justify-end mt-6">
            <button 
              type="submit"
              className="rounded-full bg-sky-500 text-white px-4 py-2 hover:bg-sky-700"
            >
              Submit Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

