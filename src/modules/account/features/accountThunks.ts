import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Account } from './accountTypes';
import * as bankAPI from './accountAPI';

export const fetchAllAccount = createAsyncThunk<Account[], void, { rejectValue: string }>(
  'bank/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await bankAPI.fetchAll();

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const fetchBalanceStatement = createAsyncThunk<Account[], void, { rejectValue: string }>(
  'bank/fetchBalanceStatement', async (_, thunkAPI) => {
    try {

      const data = await bankAPI.getBalanceStatement();

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const fetchAssetStatement = createAsyncThunk<Account[], void, { rejectValue: string }>(
  'bank/fetchAssetStatement', async (_, thunkAPI) => {
    try {

      const data = await bankAPI.getAssetStatement();

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const createAccount = createAsyncThunk<Account, Account, { rejectValue: string }>(
  'bank/create', async (createData, thunkAPI) => {
    try {
      const data = await bankAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchAccountById = createAsyncThunk<Account, number, { rejectValue: string }>(
  'bank/fetchById', async (id, thunkAPI) => {
    try {

      const data = await bankAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const updateAccount = createAsyncThunk<Account, Account, { rejectValue: string }>(
  'bank/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("Bank ID is missing or invalid");
      }

      const data = await bankAPI.update(updatedData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update'
      );

    }
  }
);

export const destroyAccount = createAsyncThunk<any, number, { rejectValue: string }>(
  'bank/delete', async (id, thunkAPI) => {
    try {

      await bankAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


