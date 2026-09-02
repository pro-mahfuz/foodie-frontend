import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Stock, StockReport } from './stockTypes';
import * as stockAPI from '../features/stockAPI';

export const fetchAllStock = createAsyncThunk<Stock[], void, { rejectValue: string }>(
  'stock/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await stockAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getStockReport = createAsyncThunk<StockReport[], void, { rejectValue: string }>(
  'stock/getStockReport', async (_, thunkAPI) => {
    try {

      const data = await stockAPI.getStockReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Stock, Stock, { rejectValue: string }>(
  'stock/create', async (createData, thunkAPI) => {
    try {
      const data = await stockAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Stock, number, { rejectValue: string }>(
  'stock/fetchById', async (id, thunkAPI) => {
    try {

      const data = await stockAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Stock, Stock, { rejectValue: string }>(
  'stock/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("stock ID is missing or invalid");
      }

      const data = await stockAPI.update(updatedData);
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
  'stock/delete', async (id, thunkAPI) => {
    try {

      await stockAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


