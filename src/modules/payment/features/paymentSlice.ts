import { createSlice } from '@reduxjs/toolkit';
import { PaymentState } from './paymentTypes';
import { create, fetchAll, fetchAllPaginated, fetchById, update, destroy } from './paymentThunks';



const initialState: PaymentState = {
  data: [],
  dataPaginated: [],
  status: 'idle',
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

const Slice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPayment
      .addCase(fetchAll.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAll.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
      })
      .addCase(fetchAll.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // fetchPaymentPaginated
      .addCase(fetchAllPaginated.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllPaginated.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.dataPaginated = action.payload.payments;
          state.totalItems = action.payload.totalItems;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllPaginated.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // createPayment
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
