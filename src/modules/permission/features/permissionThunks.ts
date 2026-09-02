import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { PermissionGroup } from './permissionTypes';
import * as permissionAPI from '../features/permissionAPI';

export const fetchPermission = createAsyncThunk<PermissionGroup[], void, { rejectValue: string }>(
  'permission/list', async (_, thunkAPI) => {
    try {

      const permissions = await permissionAPI.fetchPermission();
      return permissions;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users'
      );
    }
  }
);

