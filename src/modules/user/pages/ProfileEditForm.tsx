import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import DatePicker from "../../../components/form/date-picker.tsx";
import Select from "../../../components/form/Select.tsx";
import PhoneInput from "../../../components/form/group-input/PhoneInput.tsx";
import FileInput from "../../../components/form/input/FileInput.tsx";

import { ChangeEvent, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Profile } from "../features/userTypes.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { updateProfileWithFile } from "../features/userThunks.ts";
import { selectUserById } from "../features/userSelectors.ts";


export default function ProfileEditForm() {
  const { id } = useParams();
  const userProfile = useSelector(selectUserById(Number(id)));
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const countries = [
    { code: "AE", label: "+971" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const [formData, setFormData] = useState<Profile>({
    fullName: "",
    birthDate: "",
    gender: "",
    nationality: "",
    contactEmail: "",
    countryCode: "AE",
    phoneCode: "+971",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    profilePicture: "" as string | File,
  });

  useEffect(() => {
    if (userProfile?.profile) {
      setFormData({
        fullName: userProfile.profile.fullName || "",
        birthDate: userProfile.profile.birthDate || "",
        gender: userProfile.profile.gender || "",
        nationality: userProfile.profile.nationality || "",
        contactEmail: userProfile.profile.contactEmail || "",
        countryCode: userProfile.profile.countryCode || "",
        phoneCode: userProfile.profile.phoneCode || "",
        phoneNumber: userProfile.profile.phoneNumber || "",
        address: userProfile.profile.address || "",
        city: userProfile.profile.city || "",
        country: userProfile.profile.country || "",
        postalCode: userProfile.profile.postalCode || "",
        profilePicture: userProfile.profile.profilePicture || "",
      });
    }
  }, [userProfile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const date = selectedDates[0];
    setFormData((prev) => ({ ...prev, birthDate: date.toISOString() }));
  };

  const handlePhoneNumberChange = (countryCode: string, phoneCode: string, phoneNumber: string) => {
    setFormData((prev) => ({
      ...prev,
      countryCode,
      phoneCode,
      phoneNumber,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("birthDate", formData.birthDate);
    data.append("gender", formData.gender);
    data.append("nationality", formData.nationality);
    data.append("contactEmail", formData.contactEmail);
    data.append("countryCode", formData.countryCode);
    data.append("phoneCode", formData.phoneCode);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("address", formData.address);
    data.append("city", formData.city);
    data.append("country", formData.country);
    data.append("postalCode", formData.postalCode);

    if (formData.profilePicture instanceof File) {
      data.append("profilePicture", formData.profilePicture);
    }

    try {
      await dispatch(updateProfileWithFile({ id: Number(id), updateData: data })).unwrap();
      toast.success("User updated successfully!");
      navigate(`/user/profile/view/${userProfile?.id}`);
    } catch (err) {
      toast.error("Failed to update user.");
      console.error("Submit error:", err);
    }
  };

  return (
    <div>
      <PageMeta title="Profile Update" description="Form to update user" />
      <PageBreadcrumb pageTitle="Profile Update" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <img
                    src={
                      formData.profilePicture instanceof File
                        ? URL.createObjectURL(formData.profilePicture)
                        : formData.profilePicture
                        ? `http://localhost:5000/api${formData.profilePicture}`
                        : "http://localhost:5173/public/images/user/owner.jpeg"
                    }
                    alt="user"
                  />
                </div>
                <div className="order-3 xl:order-2">
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {userProfile?.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center xl:text-left">
                    {userProfile?.role?.name?.toUpperCase() ?? "USER"}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-success-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-success-700 lg:w-auto"
              >
                Confirm
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">Personal Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Full Name</Label>
                <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>

              <div>
                <Label>Birth Date</Label>
                <DatePicker
                  id="birthDate"
                  placeholder="Select birth date"
                  defaultDate={formData.birthDate ? new Date(formData.birthDate) : undefined}
                  onChange={handleDateChange}
                />
              </div>

              <div>
                <Label>Nationality</Label>
                <Input name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>

              <div>
                <Label>Gender</Label>
                <Select options={genderOptions} value={formData.gender} onChange={handleGenderChange} />
              </div>

              <div>
                <Label>Contact Email</Label>
                <Input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
              </div>

              <div>
                <Label>Contact Phone</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="(555) 000-0000"
                  value={{
                    countryCode: formData.countryCode,
                    phoneCode: formData.phoneCode,
                    phoneNumber: formData.phoneNumber,
                  }}
                  onChange={handlePhoneNumberChange}
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <FileInput
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, profilePicture: file }));
                    }
                  }}
                />
              </div>

              <div>
                <Label>Profile Picture Preview</Label>
            
                <img
                  src={formData.profilePicture instanceof File
                    ? URL.createObjectURL(formData.profilePicture)
                    : formData.profilePicture
                    ? `http://localhost:5000/api${formData.profilePicture}`
                    : "http://localhost:5173/public/images/user/owner.jpeg"
                  }
                  alt="Preview"
                  className="mt-2 w-20 h-20 rounded-full object-cover"
                />
              
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div>
                <Label>Country</Label>
                <Input name="country" value={formData.country} onChange={handleChange} required />
              </div>

              <div>
                <Label>City</Label>
                <Input name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input name="postalCode" value={formData.postalCode} onChange={handleChange} required />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
