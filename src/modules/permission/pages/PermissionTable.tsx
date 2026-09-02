import { useEffect } from "react";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../../components/common/PageMeta.tsx";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/store.ts";
import { fetchPermission } from "../features/permissionThunks.ts";
import { selectAllPermissions } from "../features/permissionSelectors.ts";


export default function PermissionTable() {

  const dispatch = useDispatch<AppDispatch>();
  const permissionGroup = useSelector(selectAllPermissions);
 
  

  useEffect(() => {
    dispatch(fetchPermission());
  }, [dispatch]);

  

  return (
    <>
      <PageMeta
        title="Permission List Table"
        description="Permission Table with Search, Sort, Pagination"
      />
      <PageBreadcrumb pageTitle="Permission List" />

      
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <div className="max-w-full">
            {/* Search Input */}

            {/* Table */}
            <div className="grid grid-cols-5 gap-5">
              {permissionGroup.map((group) => {

                return (
                  <div key={group.group}>
                    <div className="flex items-center justify-between mb-2 border border-gray-300 rounded p-1 bg-gray-100">
                      <div>{group.group}</div>
                    </div>
                    {group.permissions.map((permission) => (
                      <div className="mb-2" key={permission.id}>
                        <div>{permission.action}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

          </div>

          
        </div>
      </div>
    
      
    </>
  );
}
