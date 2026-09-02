import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Invoice, ProfitLoss, SaleCashReport, CustomerCashReport } from './invoiceTypes';
import { Item } from '../../item/features/itemTypes';
import * as invoiceAPI from '../features/invoiceAPI';

interface PaginatedInvoiceResponse {
  invoices: Invoice[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const fetchAllInvoice = createAsyncThunk<Invoice[], void, { rejectValue: string }>(
  'invoice/fetchAll', async (_, thunkAPI) => {
    
     try {
      const data = await invoiceAPI.fetchAll(); // make sure your API handles query params

      return data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch invoices"
      );
    }
  }
);

export const fetchAllInvoicePagination = createAsyncThunk<PaginatedInvoiceResponse, {page?: number; limit?: number; type?: string, filterText?: string, date?: string, categoryId?: number | "", partyName?: string, invoiceType?: string}, { rejectValue: string }>(
  'invoice/fetchAllPagination', async ({ page = 1, limit = 10, type="", filterText="", date="", categoryId="", partyName="", invoiceType="" }, thunkAPI) => {
     try {
      const data = await invoiceAPI.fetchAllWithPagination({ page, limit, type, filterText, date, categoryId, partyName, invoiceType });
      return data;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch invoices"
      );
    }
  }
);

export const getPurchaseReport = createAsyncThunk<Invoice[], void, { rejectValue: string }>(
  'invoice/getPurchaseReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getPurchaseReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getSaleReport = createAsyncThunk<Invoice[], void, { rejectValue: string }>(
  'invoice/getSaleReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getSaleReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getSaleContainerReport = createAsyncThunk<Item[], void, { rejectValue: string }>(
  'invoice/getSaleContainerReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getSaleContainerReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getSaleCashReport = createAsyncThunk<SaleCashReport[], void, { rejectValue: string }>(
  'invoice/getSaleCashReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getSaleCashReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getBillReport = createAsyncThunk<Invoice[], void, { rejectValue: string }>(
  'invoice/getBillReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getBillReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getProfitLossReport = createAsyncThunk<ProfitLoss[], void, { rejectValue: string }>(
  'invoice/getProfitLossReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getProfitLossReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getDailyProfitLossReport = createAsyncThunk<ProfitLoss[], void, { rejectValue: string }>(
  'invoice/getDailyProfitLossReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getDailyProfitLossReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const getSalePaymentReport = createAsyncThunk<CustomerCashReport[], void, { rejectValue: string }>(
  'invoice/getSalePaymentReport', async (_, thunkAPI) => {
    try {

      const data = await invoiceAPI.getSalePaymentReport();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Invoice, Invoice, { rejectValue: string }>(
  'invoice/create', async (createData, thunkAPI) => {
    try {
      const data = await invoiceAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Invoice, number, { rejectValue: string }>(
  'invoice/fetchById', async (id, thunkAPI) => {
    try {

      const data = await invoiceAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Invoice, Invoice, { rejectValue: string }>(
  'invoice/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("invoice ID is missing or invalid");
      }

      const data = await invoiceAPI.update(updatedData);
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
  'invoice/delete', async (id, thunkAPI) => {
    try {

      const response = await invoiceAPI.destroy(id);
      return response;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


