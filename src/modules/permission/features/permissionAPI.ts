
import axiosInstance from "../../../api/axios";
import { PermissionGroup } from './permissionTypes';

export const fetchPermission = async () => {
  try {

    const res = await axiosInstance.get('protected/permissions');
    
    return res.data.data.map((permission: PermissionGroup): PermissionGroup => (
      {

        group: permission.group,
        permissions: permission.permissions
      }
    ));

  } catch {
      throw new Error('No data available');
  }
};