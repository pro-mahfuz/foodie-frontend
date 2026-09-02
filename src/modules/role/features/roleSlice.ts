import { createSlice } from '@reduxjs/toolkit';
import { RoleState } from './roleTypes';
import { fetchRole, fetchRoleById, updateRole, deleteRole } from './roleThunks';



const initialState: RoleState = {
  data: [],
  status: 'idle',
  error: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRole
      .addCase(fetchRole.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to fetch roles';
      })

      // fetchRoleById
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingRoleIndex = state.data.findIndex(role => role.id === action.payload.id);
        if (existingRoleIndex >= 0) {
          state.data[existingRoleIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to update role';
      })

      // updateRole
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingRoleIndex = state.data.findIndex(role => role.id === action.payload.id);
        if (existingRoleIndex >= 0) {
          state.data[existingRoleIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to update role';
      })

      // deleteRole
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(role => role.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to delete role';
      })

  },
});

export default roleSlice.reducer;
