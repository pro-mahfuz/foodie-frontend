
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Select from "../../../components/form/Select.tsx";
import PhoneInput from "../../../components/form/group-input/PhoneInput.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import FileInput from "../../../components/form/input/FileInput.tsx";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";

import { toast } from "react-toastify";

import { ChangeEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { useNavigate } from "react-router-dom";
import { phoneCodeOptions, statusOptions } from "../../types.ts";
import { Business } from "../features/businessTypes.ts";
import { create } from "../features/businessThunks.ts";

export default function BusinessCreateForm() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Business>({
        businessName: "",
        businessLogo: "" as string | File,
        businessLicenseNo: "",
        businessLicenseCopy: "" as string | File,
        ownerName: "",
        email: "",
        countryCode: "AE",
        phoneCode: "+971",
        phoneNumber: "",
        trnNo: "",
        vatPercentage: 0,
        address: "",
        city: "",
        country: "",
        postalCode: "",
        isActive: true,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
    };

    const handleStatusChange = (value: boolean) => {
        setFormData((prev) => ({
        ...prev,
        isActive: value,
        }));
    };

    const handlePhoneNumberChange = (countryCode: string, phoneCode: string, phoneNumber: string) => {
        setFormData((prev) => ({
            ...prev,
            countryCode: countryCode,
            phoneCode: phoneCode,
            phoneNumber: phoneNumber
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData();

        data.append("businessName", formData.businessName ?? '');
        data.append("ownerName", formData.ownerName ?? '');
        data.append("email", formData.email ?? '');
        data.append("countryCode", formData.countryCode ?? '');
        data.append("phoneCode", formData.phoneCode ?? '');
        data.append("phoneNumber", formData.phoneNumber ?? '');
        data.append("trnNo", formData.trnNo ?? '');
        data.append("vatPercentage", String(formData.vatPercentage));
        data.append("address", formData.address ?? '');
        data.append("city", formData.city ?? '');
        data.append("country", formData.country ?? '');
        data.append("postalCode", formData.postalCode ?? '');
        data.append("isActive", String(formData.isActive) ?? ''); // convert boolean to string

        formData.businessLicenseNo && data.append("businessLicenseNo", formData.businessLicenseNo);
        formData.businessLogo instanceof File && data.append("businessLogo", formData.businessLogo);
        formData.businessLicenseCopy instanceof File && data.append("businessLicenseCopy", formData.businessLicenseCopy);


        try {
            console.log("Business Form Data: ", formData);
            await dispatch(create({ createData: data }));
            toast.success("Business created successfully!");

            navigate("/business/list");
        } catch (err) {
            toast.error("Failed to create business.");
            console.error("Submit error:", err);
        }
    };


  return (
    <div>
      <PageMeta
        title="Business Create"
        description="Form to create new user"
      />
      <PageBreadcrumb pageTitle="Business Create" />

      <ComponentCard title="Fill up all fields to create a new business!">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Business Name</Label>
              <Input
                type="text"
                name="businessName"
                placeholder="Enter your Business name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
                <Label>Business Logo</Label>
                <FileInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, businessLogo: file }));
                    }
                  }}
                />
            </div>

            <div>
              <Label>Business License No</Label>
              <Input
                type="text"
                name="businessLicenseNo"
                placeholder="Enter your Business License No"
                value={formData.businessLicenseNo}
                onChange={handleChange}
              />
            </div>

            <div>
                <Label>Business License Copy</Label>
                <FileInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, businessLicenseCopy: file }));
                    }
                  }}
                />
            </div>

            <div>
              <Label>Owner Name</Label>
              <Input
                type="text"
                name="ownerName"
                placeholder="Enter Owner name"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Phone</Label>
              <PhoneInput
                selectPosition="start"
                countries={phoneCodeOptions}
                placeholder="+1 (555) 000-0000"
                value={{
                  countryCode: formData.countryCode ?? '',
                  phoneCode: formData.phoneCode ?? '',
                  phoneNumber: formData.phoneNumber ?? '',
                }}
                onChange={handlePhoneNumberChange}
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
                required
              />
            </div>

            <div>
              <Label>Vat (%)</Label>
              <Input
                type="text"
                name="vatPercentage"
                placeholder="Enter Vat"
                value={formData.vatPercentage}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>City</Label>
              <Input
                type="text"
                name="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Country</Label>
              <Input
                type="text"
                name="country"
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Postal Code</Label>
              <Input
                type="text"
                name="postalCode"
                placeholder="Enter your postal code"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Select Status</Label>
              <Select
                options={statusOptions}
                placeholder="Select status"
                onChange={handleStatusChange}
                className="dark:bg-dark-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="success">Submit</Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
