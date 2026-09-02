import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Ledger } from './ledgerTypes.ts';
import * as LedgerAPI from './ledgerAPI.ts';

export const fetchAll = createAsyncThunk<Ledger[], { summary?: boolean; partyId?: number } | void, { rejectValue: string }>(
  'ledger/fetchAll', async (options, thunkAPI) => {
    try {

      const data = await LedgerAPI.fetchAll(options ?? {});

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Ledger, Ledger, { rejectValue: string }>(
  'ledger/create', async (createData, thunkAPI) => {
    try {
      const data = await LedgerAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Ledger, number, { rejectValue: string }>(
  'ledger/fetchById', async (id, thunkAPI) => {
    try {

      const data = await LedgerAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Ledger, Ledger, { rejectValue: string }>(
  'ledger/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("ledger ID is missing or invalid");
      }

      const data = await LedgerAPI.update(updatedData);
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
  'ledger/delete', async (id, thunkAPI) => {
    try {

      await LedgerAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


