import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { ChangeEvent, useState, useEffect } from "react";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Select from "../../../components/form/Select.tsx";
import PhoneInput from "../../../components/form/group-input/PhoneInput.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, ListBulletIcon, PlusIcon } from "@heroicons/react/20/solid";

import { toast } from "react-toastify";
import { Party } from "../features/partyTypes.ts";
import { partyStatusOptions, phoneCodeOptions } from "../../../modules/types.ts";
import { createParty } from "../features/partyThunks.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { selectAuth } from "../../auth/features/authSelectors";
import { selectUserById } from "../../user/features/userSelectors";

export default function PartyCreateForm() {
  const { partyType = 'party' } = useParams() as { partyType?: 'party' | 'customer' | 'supplier' };
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  // console.log("PartyCreate authUser: ", authUser);
  // console.log("PartyCreate user: ", user);

  // const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState<Party>({
    businessId: 0,
    type: 'party',
    name: '',
    email: '',
    countryCode: '',
    phoneCode: '',
    phoneNumber: '',
    trnNo: '',
    address: '',
    city: '',
    country: '',
    nationalId: '',
    tradeLicense: '',
    openingBalance: 0,
    isActive: true,
    status: "active",
  });

  useEffect(() => {
    if (user?.business?.id) {
      setFormData((prev) => ({
        ...prev,
        businessId: user?.business?.id,
        type: partyType
      }));
    }
  }, [user, partyType]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "openingBalance" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as Party['status'], isActive: value === "active" }));
  };

  const handlePhoneNumberChange = (countryCode: string, phoneCode: string, phoneNumber: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode,
      phoneCode,
      phoneNumber,
    }));
  };

  // const validateForm = () => {
  //   const newErrors: { [key: string]: string } = {};

  //   if (!formData.name.trim()) newErrors.name = "Name is required";
  //   // if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
  //   if (!formData.type) newErrors.type = "Party type is required";
  //   if (!formData.address.trim()) newErrors.address = "Address is required";

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   toast.error("Please fix the errors in the form.");
    //   return;
    // }

    try {
      await dispatch(createParty(formData));
      toast.success("Party created successfully!");
      navigate(`/party/${formData.type}/list`);
    } catch (err) {
      toast.error("Failed to create party.");
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title={`${partyType ? partyType.charAt(0).toUpperCase() + partyType.slice(1).toLowerCase() : ''} Create`} description="Form to create new supplier or customer" />
      <PageBreadcrumb pageTitle={`${partyType ? partyType.charAt(0).toUpperCase() + partyType.slice(1).toLowerCase() : ''} Create`} />

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Party management</p><div className="mt-1 flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create {partyType === 'party' ? 'Party' : partyType.charAt(0).toUpperCase() + partyType.slice(1)}</h1><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">New record</span></div><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add contact, business, and address details for a new record.</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button><button type="button" onClick={() => navigate(`/party/${partyType}/list`)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> View list</button></div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Contact details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Primary information used to identify and contact this party.</p></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="md:col-span-1">
              <Label>Party Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />
              
            </div>

            <div className="md:col-span-1">
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <PhoneInput
                selectPosition="start"
                countries={phoneCodeOptions}
                placeholder="50 000 0000"
                value={{
                  countryCode: formData.countryCode ?? '',
                  phoneCode: formData.phoneCode ?? '',
                  phoneNumber: formData.phoneNumber ?? '',
                }}
                onChange={handlePhoneNumberChange}
              />
              
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Business details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tax, identification, balance, and account status.</p></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <Label>Trade License</Label>
              <Input
                type="text"
                name="tradeLicense"
                placeholder="Trade license number"
                value={formData.tradeLicense}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>TRN No</Label>
              <Input
                type="text"
                name="trnNo"
                placeholder="Enter TRN No"
                value={formData.trnNo}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>EID / Passport No</Label>
              <Input type="text" name="nationalId" placeholder="ID / Passport Number" value={formData.nationalId} onChange={handleChange} />
            </div>
            <div>
              <Label>Opening Balance</Label>
              <Input type="number" name="openingBalance" placeholder="0.00" value={formData.openingBalance} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <Label>Status</Label>
              <Select options={partyStatusOptions} placeholder="Select status" value={formData.status} onChange={handleStatusChange} className="dark:bg-dark-900" />
            </div>

          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Address details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Location details for this party.</p></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                placeholder="Full address"
                value={formData.address}
                onChange={handleChange}
              />
              
            </div>

            <div>
              <Label>City</Label>
              <Input
                type="text"
                name="city"
                placeholder="City name"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Country</Label>
              <Input
                type="text"
                name="country"
                placeholder="Country name"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

          </div>
        </section>

        <div className="flex justify-end gap-3 lg:col-span-2"><button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300">Cancel</button><Button type="submit" variant="success"><span className="inline-flex items-center gap-2"><PlusIcon className="h-4 w-4" /> Create {partyType === 'party' ? 'Party' : partyType.charAt(0).toUpperCase() + partyType.slice(1)}</span></Button></div>
      </form>
    </div>
  );
}



