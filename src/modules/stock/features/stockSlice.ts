import { createSlice } from '@reduxjs/toolkit';
import { StockState } from './stockTypes';
import { create, fetchAllStock, getStockReport, fetchById, update, destroy } from './stockThunks';



const initialState: StockState = {
  data: [],
  report: [],
  status: 'idle',
  error: null,
};

const Slice = createSlice({
  name: 'stock',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchParty
      .addCase(fetchAllStock.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllStock.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
      })
      .addCase(fetchAllStock.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // getStockReport
      .addCase(getStockReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getStockReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.report = action.payload;
      })
      .addCase(getStockReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // createParty
      .addCase(create.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
      })
      .addCase(create.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // fetchUserById
      .addCase(fetchById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingIndex >= 0) {
          state.data[existingIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // updateUser
      .addCase(update.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(update.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // deleteUser
      .addCase(destroy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(d => d.id !== action.payload);
      })
      .addCase(destroy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      
  },
});

export default Slice.reducer;
