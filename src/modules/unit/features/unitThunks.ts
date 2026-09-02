import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Unit } from './unitTypes';
import * as UnitAPI from '../features/unitAPI';

export const fetchAllUnit = createAsyncThunk<Unit[], void, { rejectValue: string }>(
  'unit/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await UnitAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const createUnit = createAsyncThunk<Unit, Unit, { rejectValue: string }>(
  'unit/create', async (createData, thunkAPI) => {
    try {
      const data = await UnitAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchUnitById = createAsyncThunk<Unit, number, { rejectValue: string }>(
  'unit/fetchById', async (id, thunkAPI) => {
    try {

      const data = await UnitAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const updateUnit = createAsyncThunk<Unit, Unit, { rejectValue: string }>(
  'unit/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("invoice ID is missing or invalid");
      }

      const data = await UnitAPI.update(updatedData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update'
      );

    }
  }
);

export const destroyUnit = createAsyncThunk<any, number, { rejectValue: string }>(
  'unit/delete', async (id, thunkAPI) => {
    try {

      await UnitAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


