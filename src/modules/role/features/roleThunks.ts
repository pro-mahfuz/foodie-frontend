import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Role, SetRoleRequest, CreateRoleRequest } from './roleTypes';
import * as roleAPI from '../features/roleAPI';

export const fetchRole = createAsyncThunk<Role[], void, { rejectValue: string }>(
  'roles', async (_, thunkAPI) => {
    try {

      const roles = await roleAPI.fetchRole();
      return roles;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users'
      );
    }
  }
);

export const createRole = createAsyncThunk<Role, CreateRoleRequest, { rejectValue: string }>(
  'role/create', async (roleData, thunkAPI) => {
    try {

      const newUser = await roleAPI.createRole(roleData);
      return newUser;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create user'
      );

    }
  }
);

export const fetchRoleById = createAsyncThunk<Role, number, { rejectValue: string }>(
  'role/fetchRoleById', async (id, thunkAPI) => {
    try {

      const role = await roleAPI.fetchRoleById(id);
      console.log("fetch Role Thunk", role);
      return role;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users'
      );
    }
  }
);

export const updateRole = createAsyncThunk<Role, SetRoleRequest, { rejectValue: string }>(
  'role/update', async (updataData, thunkAPI) => {
    try {

      const updateRole = await roleAPI.updateRole(updataData);
      return updateRole;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users'
      );
    }
  }
);

export const deleteRole = createAsyncThunk<number, number, { rejectValue: string }>(
  'role/delete', async (id, thunkAPI) => {
    try {

      const response = await roleAPI.deleteRole(id);
      return response;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete user'
      );

    }
  }
);