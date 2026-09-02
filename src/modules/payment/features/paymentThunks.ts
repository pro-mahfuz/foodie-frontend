import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Payment } from './paymentTypes';
import * as paymentAPI from '../features/paymentAPI';

interface PaginatedPaymentResponse {
  payments: Payment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const fetchAll = createAsyncThunk<Payment[], void, { rejectValue: string }>(
  'payment/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await paymentAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const fetchAllPaginated = createAsyncThunk<PaginatedPaymentResponse, {page?: number; limit?: number; system:number, filterText?: string, paymentDate?: string, partyId?: string | number, invoiceRef?: string, paymentRef?: string}, { rejectValue: string }>(
  'payment/fetchAllPaginated', async ({ page = 1, limit = 10, system, filterText="", paymentDate="", partyId="", invoiceRef="", paymentRef="" }, thunkAPI) => {
    try {

      const data = await paymentAPI.fetchAllPaginated({ page, limit, system, filterText, paymentDate, partyId, invoiceRef, paymentRef });
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Payment, Payment, { rejectValue: string }>(
  'payment/create', async (createData, thunkAPI) => {
    try {
      const data = await paymentAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Payment, number, { rejectValue: string }>(
  'payment/fetchById', async (id, thunkAPI) => {
    try {

      const data = await paymentAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Payment, Payment, { rejectValue: string }>(
  'payment/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("payment ID is missing or invalid");
      }

      const data = await paymentAPI.update(updatedData);
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
  'payment/delete', async (id, thunkAPI) => {
    try {

      await paymentAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


