import { createSlice } from '@reduxjs/toolkit';
import { InvoiceState } from './invoiceTypes';
import { create, fetchAllInvoice, fetchAllInvoicePagination, getPurchaseReport, getSaleReport, getSaleContainerReport, getSaleCashReport, getBillReport, getSalePaymentReport, getProfitLossReport, getDailyProfitLossReport, fetchById, update, destroy } from './invoiceThunks';



const initialState: InvoiceState = {
  data: [],
  dataPaginated: [],
  invoiceData: null,
  saleReport: [],
  purchaseReport: [],
  saleContainerReport: [],
  saleCashReport: [],
  billReport: [],
  salePaymentReport: [],
  profitLossReport: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  status: 'idle',
  error: null,
};

const Slice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchInvoice
      .addCase(fetchAllInvoice.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllInvoice.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
      })
      .addCase(fetchAllInvoice.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })
      // fetchInvoicePagination
      .addCase(fetchAllInvoicePagination.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllInvoicePagination.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.dataPaginated = action.payload.invoices;
          state.totalItems = action.payload.totalItems;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllInvoicePagination.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // getPurchaseReport
      .addCase(getPurchaseReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.purchaseReport = action.payload;
      })
      .addCase(getPurchaseReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getSaleReport
      .addCase(getSaleReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getSaleReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.saleReport = action.payload;
      })
      .addCase(getSaleReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getSaleContainerReport
      .addCase(getSaleContainerReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.saleContainerReport = action.payload;
      })
      .addCase(getSaleContainerReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getSaleReport
      .addCase(getSaleCashReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getSaleCashReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.saleCashReport = action.payload;
      })
      .addCase(getSaleCashReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getBillReport
      .addCase(getBillReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getBillReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.billReport = action.payload;
      })
      .addCase(getBillReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getSalePaymentReport
      .addCase(getSalePaymentReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getSalePaymentReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.salePaymentReport = action.payload;
      })
      .addCase(getSalePaymentReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getProfitLossReport
      .addCase(getProfitLossReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProfitLossReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profitLossReport = action.payload;
      })
      .addCase(getProfitLossReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // getDailyProfitLossReport
      .addCase(getDailyProfitLossReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDailyProfitLossReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profitLossReport = action.payload;
      })
      .addCase(getDailyProfitLossReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // createParty
      .addCase(create.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
        state.invoiceData = action.payload;
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
        state.invoiceData = null;
        state.invoiceData = action.payload;
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
