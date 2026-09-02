import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
// import Select from "../../../components/form/Select.tsx";
import PhoneInput from "../../../components/form/group-input/PhoneInput.tsx";
import { EyeCloseIcon, EyeIcon } from "../../../icons/index.ts";
import Button from "../../../components/ui/button/Button.tsx";
import Select from "react-select";

import { ChangeEvent, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUser, fetchUserById } from "../features/userThunks.ts";
import { fetchRole } from "../../role/features/roleThunks.ts";
import { fetchAll } from "../../business/features/businessThunks.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { phoneCodeOptions, statusOptions, OptionNumberType, OptionBooleanType, selectStyles } from "../../types.ts";
import { User } from "../features/userTypes.ts";
import { selectAllBusiness } from "../../business/features/businessSelectors.ts";
import { selectAllRoles } from "../../role/features/roleSelectors.ts";
import { selectUserById } from "../features/userSelectors.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";

export default function UserEditForm() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const authUser = useSelector(selectUser);
    const businesses = useSelector(selectAllBusiness);
    const roles = useSelector(selectAllRoles);
    const user = useSelector(selectUserById(Number(id)));

    const [formData, setFormData] = useState<User>({
      id: user?.id,
      businessId: Number(authUser?.business?.id),
      name: "",
      email: "",
      countryCode: "AE",
      phoneCode: "+971",
      phoneNumber: "",
      roleId: Number(user?.roleId),
      password: "",
      isActive: true,
    });

    useEffect(() => {
      dispatch(fetchAll());
      dispatch(fetchRole());

      if (!user) {
          dispatch(fetchUserById(Number(id)));
      } else {
          setFormData({
              id: user.id,
              businessId: user.businessId,
              name: user.name,
              email: user.email,
              countryCode: user.countryCode,
              phoneCode: user.phoneCode,
              phoneNumber: user.phoneNumber,
              roleId: Number(user.role?.id), 
              isActive: user.isActive,
          });
      }
    }, [user, id, dispatch]);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });
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
        try {
            console.log("formData: ", formData);
            await dispatch(updateUser(formData));
            toast.success("User created successfully!");

            navigate("/user/list"); 
        } catch (err) {
            toast.error("Failed to create user.");
            console.error("Submit error:", err);
        }
    };

  return (
    <div>
      <PageMeta
        title="User Update"
        description="Form to update user"
      />
      <PageBreadcrumb pageTitle="User Update" />

      <ComponentCard title="Fill up all fields to update a user!">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Select Business</Label>
              <Select
                  options={businesses.map((b) => ({
                      label: b.businessName,
                      value: b.id,
                  }))}
                  placeholder="Search and select party"
                  value={
                      businesses
                          .filter((b) => b.id === formData.businessId)
                          .map((b) => ({ label: b.businessName, value: b.id }))[0] || null
                  }
                  onChange={(selectedOption) =>
                      setFormData((prev) => ({
                          ...prev,
                          businessId: selectedOption?.value ?? 0 ,
                      }))
                  }
                  isClearable
                  styles={selectStyles}
                  classNamePrefix="react-select"
              />
            </div>

            <div>
              <Label>User Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter your username"
                value={formData.name}
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
                  countryCode: formData.countryCode,
                  phoneCode: formData.phoneCode,
                  phoneNumber: formData.phoneNumber,
                }}
                onChange={handlePhoneNumberChange}
              />
            </div>

            <div>
              <Label>Select Role</Label>
              <Select<OptionNumberType>
                  options={roles.map((r) => ({
                      label: r.name,
                      value: r.id,
                  }))}
                  placeholder="Select role"
                  value={
                    roles
                      .filter((r) => r.id === formData.roleId)
                      .map((r) => ({ label: r.name, value: r.id }))[0] || null
                  }
                  onChange={(selectedOption) => {
                      setFormData(prev => ({
                          ...prev,
                          roleId: selectedOption?.value ?? 0,
                      }));
                  }}
                  isClearable
                  styles={selectStyles}
                  classNamePrefix="react-select"
              />
            </div>
            

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label>Select Status</Label>
              <Select<OptionBooleanType>
                  options={statusOptions}
                  placeholder="Select category"
                  value={statusOptions.find((option) => option.value === formData.isActive)}
                  onChange={(selectedOption) => {
                      setFormData(prev => ({
                          ...prev,
                          isActive: selectedOption?.value ?? true,
                      }));
                  }}
                  isClearable
                  styles={selectStyles}
                  classNamePrefix="react-select"
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
