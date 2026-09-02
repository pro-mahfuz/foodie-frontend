import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Party, ReceivablePayableReport } from './partyTypes';
import * as partyAPI from '../features/partyAPI';

interface PaginatedInvoiceResponse {
  parties: Party[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const fetchParty = createAsyncThunk<Party[], {type?: string}, { rejectValue: string }>(
  'party/fetch', async ({type=""}, thunkAPI) => {
    try {

      const data = await partyAPI.fetchParty({type});

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch party'
      );
    }
  }
);

export const fetchPartyPaginated = createAsyncThunk<PaginatedInvoiceResponse, {page?: number; limit?: number; type?: string, filterText?: number}, { rejectValue: string }>(
  'party/fetch/paginated', async ({ page, limit, type="", filterText }, thunkAPI) => {
    try {

      const data = await partyAPI.fetchPartyPaginated({ page, limit, type, filterText });

      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch party'
      );
    }
  }
);

export const fetchReceivablePayable = createAsyncThunk<ReceivablePayableReport, void, { rejectValue: string }>(
  'party/receivablePayable', async (_, thunkAPI) => {
    try {

      const parties = await partyAPI.fetchReceivablePayable();
      return parties;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch party'
      );
    }
  }
);

export const createParty = createAsyncThunk<Party, Party, { rejectValue: string }>(
  'party/create', async (partyData, thunkAPI) => {
    try {
      const newParty = await partyAPI.createParty(partyData);
      return newParty;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create party'
      );

    }
  }
);

export const fetchPartyById = createAsyncThunk<Party, number, { rejectValue: string }>(
  'party/fetchPartyById', async (id, thunkAPI) => {
    try {

      const party = await partyAPI.fetchPartyById(id);
      return party;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch party'
      );

    }
  }
);

export const updateParty = createAsyncThunk<Party, Party, { rejectValue: string }>(
  'party/update', async (updatedParty, thunkAPI) => {
    try {

      if (typeof updatedParty.id !== 'number') {
        return thunkAPI.rejectWithValue("Party ID is missing or invalid");
      }

      const party = await partyAPI.updateParty(updatedParty.id, updatedParty);
      return party;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update party'
      );

    }
  }
);

export const deleteParty = createAsyncThunk<any, number, { rejectValue: string }>(
  'party/delete', async (id, thunkAPI) => {
    try {

      await partyAPI.deleteParty(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete party'
      );

    }
  }
);


