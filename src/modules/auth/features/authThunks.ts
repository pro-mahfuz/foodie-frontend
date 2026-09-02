// src/modules/auth/store/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../user/features/userTypes';
import * as authAPI from "./authAPI";
import { AxiosError } from 'axios';


export const login = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials); // Adjust API endpoint

    // Assuming your response looks like: { user, accessToken, refreshToken }
    return response;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});



