import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Item } from './itemTypes';
import * as itemAPI from '../features/itemAPI';

export const fetchAllItem = createAsyncThunk<Item[], void, { rejectValue: string }>(
  'item/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await itemAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const createItem = createAsyncThunk<Item, Item, { rejectValue: string }>(
  'item/create', async (createData, thunkAPI) => {
    try {
      const data = await itemAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchItemById = createAsyncThunk<Item, number, { rejectValue: string }>(
  'item/fetchById', async (id, thunkAPI) => {
    try {

      const data = await itemAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const updateItem = createAsyncThunk<Item, Item, { rejectValue: string }>(
  'item/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("invoice ID is missing or invalid");
      }

      const data = await itemAPI.update(updatedData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update'
      );

    }
  }
);

export const destroyItem = createAsyncThunk<any, number, { rejectValue: string }>(
  'item/delete', async (id, thunkAPI) => {
    try {

      await itemAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);


