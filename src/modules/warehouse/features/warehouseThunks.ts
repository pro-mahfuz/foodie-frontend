import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Warehouse } from './warehouseTypes';
import * as warehouseAPI from '../features/warehouseAPI';

export const fetchAllWarehouse = createAsyncThunk<Warehouse[], void, { rejectValue: string }>(
  'warehouse/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await warehouseAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Warehouse, Warehouse, { rejectValue: string }>(
  'warehouse/create', async (createData, thunkAPI) => {
    try {
      const data = await warehouseAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Warehouse, number, { rejectValue: string }>(
  'warehouse/fetchById', async (id, thunkAPI) => {
    try {

      const data = await warehouseAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Warehouse, Warehouse, { rejectValue: string }>(
  'warehouse/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("warehouse ID is missing or invalid");
      }

      const data = await warehouseAPI.update(updatedData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update'
      );

    }
  }
);

export const destroy = createAsyncThunk<any, number, { rejectValue: string }>(
  'warehouse/delete', async (id, thunkAPI) => {
    try {

      await warehouseAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


