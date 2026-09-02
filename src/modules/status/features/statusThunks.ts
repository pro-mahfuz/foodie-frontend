import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Status } from './statusTypes';
import * as StatusAPI from '../features/statusAPI';

export const fetchAllStatus = createAsyncThunk<Status[], void, { rejectValue: string }>(
  'status/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await StatusAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const createStatus = createAsyncThunk<Status, Status, { rejectValue: string }>(
  'status/create', async (createData, thunkAPI) => {
    try {
      const data = await StatusAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchStatusById = createAsyncThunk<Status, number, { rejectValue: string }>(
  'status/fetchById', async (id, thunkAPI) => {
    try {

      const data = await StatusAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const updateStatus = createAsyncThunk<Status, Status, { rejectValue: string }>(
  'status/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("invoice ID is missing or invalid");
      }

      const data = await StatusAPI.update(updatedData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update'
      );

    }
  }
);

export const destroyStatus = createAsyncThunk<any, number, { rejectValue: string }>(
  'status/delete', async (id, thunkAPI) => {
    try {

      await StatusAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


