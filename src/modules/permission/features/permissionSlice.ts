import { createSlice } from '@reduxjs/toolkit';
import { PermissionState } from './permissionTypes';
import { fetchPermission } from './permissionThunks';



const initialState: PermissionState = {
  permissions: [],
  status: 'idle',
  error: null,
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchPermission.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPermission.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.permissions = action.payload;
      })
      .addCase(fetchPermission.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to fetch permissions';
      })

  },
});

export default permissionSlice.reducer;
