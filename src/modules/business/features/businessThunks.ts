import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Business } from './businessTypes';
import * as businessAPI from '../features/businessAPI';

export const fetchAll = createAsyncThunk<Business[], void, { rejectValue: string }>(
  'business/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await businessAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Business, { createData: FormData }, { rejectValue: string }>(
  'business/create', async ({ createData }, thunkAPI) => {
    try {
      const data = await businessAPI.create(createData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Business, number, { rejectValue: string }>(
  'business/fetchById', async (id, thunkAPI) => {
    try {

      const data = await businessAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Business, { updatedData: FormData }, { rejectValue: string }>(
  'business/update', async ({ updatedData }, thunkAPI) => {
    try {

      const id = updatedData.get("id");

      if (!id || typeof id !== 'string') {
        return thunkAPI.rejectWithValue("Business ID is missing or invalid");
      }

      const data = await businessAPI.update(updatedData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
  'business/delete', async (id, thunkAPI) => {
    try {

      const res = await businessAPI.destroy(id);
      return res.data.data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


