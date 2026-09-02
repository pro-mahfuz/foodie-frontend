import { createSlice } from '@reduxjs/toolkit';
import { UnitState } from './unitTypes';
import { createUnit, fetchAllUnit, fetchUnitById, updateUnit, destroyUnit } from './unitThunks';



const initialState: UnitState = {
  data: [],
  status: 'idle',
  error: null,
};

const Slice = createSlice({
  name: 'Unit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchParty
      .addCase(fetchAllUnit.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllUnit.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
          //console.log("action.payload: ", action.payload);
      })
      .addCase(fetchAllUnit.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // createParty
      .addCase(createUnit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // fetchUserById
      .addCase(fetchUnitById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingIndex >= 0) {
          state.data[existingIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchUnitById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // updateUser
      .addCase(updateUnit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // deleteUser
      .addCase(destroyUnit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(d => d.id !== action.payload);
      })
      .addCase(destroyUnit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      
  },
});

export default Slice.reducer;
