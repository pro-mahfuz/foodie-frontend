import { AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Container, ContainerLifecycleStatus } from './containerTypes';
import * as containerAPI from '../features/containerAPI';

export const fetchAll = createAsyncThunk<Container[], void, { rejectValue: string }>(
  'container/fetchAll', async (_, thunkAPI) => {
    try {

      const data = await containerAPI.fetchAll();
      return data;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch');
    }
  }
);

export const create = createAsyncThunk<Container, Container, { rejectValue: string }>(
  'container/create', async (createData, thunkAPI) => {
    try {
      const data = await containerAPI.create(createData);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create'
      );

    }
  }
);

export const fetchById = createAsyncThunk<Container, number, { rejectValue: string }>(
  'container/fetchById', async (id, thunkAPI) => {
    try {

      const data = await containerAPI.fetchById(id);
      return data;

    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch'
      );

    }
  }
);

export const update = createAsyncThunk<Container, Container, { rejectValue: string }>(
  'container/update', async (updatedData, thunkAPI) => {
    try {

      if (typeof updatedData.id !== 'number') {
        return thunkAPI.rejectWithValue("container ID is missing or invalid");
      }

      const data = await containerAPI.update(updatedData);
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
  'container/delete', async (id, thunkAPI) => {
    try {

      await containerAPI.destroy(id);
      return id;
      
    } catch (err) {

      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete'
      );

    }
  }
);

export const setStatus = createAsyncThunk<Container, { id: number; status: ContainerLifecycleStatus }, { rejectValue: string }>(
  'container/setStatus', async ({ id, status }, thunkAPI) => {
    try {
      return await containerAPI.setStatus(id, status);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Failed to update container status');
    }
  }
);


