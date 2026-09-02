import { useEffect, useState } from "react";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table/index.tsx";
import { useModal } from "../../../hooks/useModal.ts";
import ConfirmationModal from "../../../components/ui/modal/ConfirmationModal.tsx";
import { toast } from "react-toastify";

import { fetchRole, deleteRole } from "../features/roleThunks.ts";
import { selectRoles, selectRoleStatus } from "../features/roleSelectors.ts";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { useNavigate } from "react-router-dom";
import { Role } from "../features/roleTypes.ts";
import { selectUser } from "../../auth/features/authSelectors.ts";


export default function RoleTable() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const status = useSelector(selectRoleStatus);
  const authUser = useSelector(selectUser);
  const roles = useSelector(selectRoles(Number(authUser?.business?.id)));
  console.log("roles", roles);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
 
  useEffect(() => {
    dispatch(fetchRole());
  }, [dispatch]);

  const handleEdit = (role: Role) => {
    navigate(`/role/edit/${role.id}`);
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    
    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      toast.success("Role deleted successfully");
    } catch (error: any) {
      toast.error(error);
    }
    closeAndResetModal();
    dispatch(fetchRole());
  };

  const closeAndResetModal = () => {
    setSelectedRole(null);
    closeModal();
  };

  return (
    <>
      <PageMeta
        title="Role List Table"
        description="Roles Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Role List" />

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full">
            <Table>
              <TableHeader className="border-b border-t border-gray-100 dark:border-white/[0.05] bg-gray-200 text-black text-sm dark:bg-gray-800 dark:text-gray-400">
                <TableRow>
                  <TableCell isHeader className="text-center px-4 py-2">Sl</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Role Name</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Permissions</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">isActive</TableCell>
                  <TableCell isHeader className="text-center px-4 py-2">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      Loading roles...
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-300">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.filter(role => role.name.toLowerCase() !== "root").map((role, index) => (
                    <TableRow key={role.id} className="border-b border-gray-100 dark:border-white/[0.05]">
                      
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {index+1}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {role.name}
                      </TableCell>
                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-1">
                        {role.permissions.map((permission) => (
                          <div key={permission.id} className="text-sm font-semibold">{permission.name}</div>
                        )) ?? "N/A" }
                        </div>
                      </TableCell>

                      <TableCell className="text-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {role.isActive ? 'Yes' : 'No'}
                      </TableCell>
                      
                      <TableCell className="text-center px-4 py-2 text-sm overflow-visible">
                        {authUser?.role?.id != role.id ? (
                          <Menu as="div" className="relative inline-block text-left">
                            <MenuButton className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-1 text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none">
                              Actions
                              <ChevronDownIcon className="h-4 w-4 text-white" />
                            </MenuButton>

                            <MenuItems className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-sky-500 ring-opacity-5 focus:outline-none">
                              <div className="py-1">
                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleEdit(role)}
                                      className={`${
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                      } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      Edit
                                    </button>
                                  )}
                                </MenuItem>

                                <MenuItem>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedRole(role);
                                        openModal();
                                      }}
                                      className={`${
                                        active ? 'bg-red-100 text-red-700' : 'text-red-600'
                                      } flex w-full items-center gap-2 px-4 py-2 text-sm`}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
                              </div>
                            </MenuItems>
                          </Menu>
                        ) : (
                          <span className="text-gray-500 italic">No Action</span>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isOpen}
        title="Are you sure you want to delete this user?"
        width="400px"
        onCancel={closeAndResetModal}
        onConfirm={handleDelete}
      />
    </>
  );
}
