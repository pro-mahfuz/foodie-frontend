import { useState, useEffect, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import Checkbox from "../../../components/form/input/Checkbox.tsx";
import Select from "../../../components/form/Select.tsx";
import { toast } from "react-toastify";

import { fetchRoleById, updateRole } from "../features/roleThunks.ts";
import { selectAllRoles } from "../features/roleSelectors.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";
import { selectAllPermissions } from "../../permission/features/permissionSelectors.ts";
import { fetchPermission } from "../../permission/features/permissionThunks.ts";
import { AppDispatch } from "../../../store/store.ts";
import { statusOptions } from "../../types.ts";

export default function RoleEditForm() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector(selectUser);
  const roles = useSelector(selectAllRoles);
  const permissionGroup = useSelector(selectAllPermissions);

  const [formData, setFormData] = useState({
    businessId: Number(authUser?.business?.id),
    roleId: 0,
    name: "",
    action: "",
    isActive: true,
    permissionIds: [] as number[],
  });

  // Collect all permission IDs for global check all
  const allPermissionIds = permissionGroup.flatMap(group => group.permissions.map(p => Number(p.id)));

  useEffect(() => {
    const role = roles.find((r) => r.id === Number(id));
    if (!role) {
      dispatch(fetchRoleById(Number(id)));
    } else {
      setFormData({
        businessId: role.businessId,
        roleId: role.id,
        name: role.name,
        action: role.action,
        isActive: !!role.isActive,
        permissionIds: role.permissions?.map((p) => Number(p.id)) || [],
      });
    }

    if (!permissionGroup || permissionGroup.length === 0) {
      dispatch(fetchPermission());
    }
  }, [id, roles, permissionGroup, dispatch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  // Global check/uncheck all
  const handleCheckAll = () => {
    setFormData((prev) => ({
      ...prev,
      permissionIds:
        prev.permissionIds.length === allPermissionIds.length
          ? [] // uncheck all
          : allPermissionIds, // check all
    }));
  };

  // Group-level check/uncheck
  const handleGroupCheck = (groupPermissions: typeof permissionGroup[0]["permissions"]) => {
    const groupIds = groupPermissions.map(p => Number(p.id));
    const allChecked = groupIds.every(id => formData.permissionIds.includes(id));

    setFormData((prev) => ({
      ...prev,
      permissionIds: allChecked
        ? prev.permissionIds.filter(id => !groupIds.includes(id)) // uncheck group
        : [...new Set([...prev.permissionIds, ...groupIds])], // check group
    }));
  };

  const handleStatusChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateRole(formData));
      toast.success("Role updated successfully!");
      navigate("/role/list");
    } catch (err) {
      toast.error("Failed to update role.");
      console.error("Submit error:", err);
    }
  };

  return (
    <>
      <PageMeta title="Role Edit" description="Role Edit" />
      <PageBreadcrumb pageTitle="Role Edit" />

      <ComponentCard title="Fill up all fields to edit role!">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Role Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Enter role name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label>Select Status</Label>
              <Select
                options={statusOptions}
                placeholder="Select status"
                value={formData.isActive}
                onChange={handleStatusChange}
                className="dark:bg-dark-900"
              />
            </div>
          </div>

          <div>
            <Label>Permissions</Label>

            {/* Global Check / Uncheck All */}
            <div className="mb-2">
              <Checkbox
                id="check-all"
                label="Check / Uncheck All"
                checked={formData.permissionIds.length === allPermissionIds.length}
                onChange={handleCheckAll}
              />
            </div>

            {/* Permission Groups */}
            <div className="grid grid-cols-5 gap-5">
              {permissionGroup.map((group) => {
                const groupIds = group.permissions.map(p => Number(p.id));
                const groupChecked = groupIds.every(id => formData.permissionIds.includes(id));

                return (
                  <div key={group.group}>
                    <div className="flex items-center justify-between mb-2 border border-gray-300 rounded p-1 bg-gray-100">
                      <Label>{group.group}</Label>
                      <Checkbox
                        id={`check-group-${group.group}`}
                        label="All"
                        checked={groupChecked}
                        onChange={() => handleGroupCheck(group.permissions)}
                      />
                    </div>
                    {group.permissions.map((permission) => (
                      <div className="mb-2" key={permission.id}>
                        <Checkbox
                          id={`perm-${permission.id}`}
                          label={permission.name}
                          checked={formData.permissionIds.includes(Number(permission.id))}
                          onChange={() => handleCheckboxChange(Number(permission.id))}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="success">
              Submit
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
