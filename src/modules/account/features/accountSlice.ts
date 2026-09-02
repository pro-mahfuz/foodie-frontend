import { createSlice } from '@reduxjs/toolkit';
import { AccountState } from './accountTypes';
import { createAccount, fetchAllAccount, fetchBalanceStatement, fetchAccountById, updateAccount, destroyAccount, fetchAssetStatement } from './accountThunks';



const initialState: AccountState = {
  data: [],
  balanceReport: [],
  assetReport: [],
  status: 'idle',
  error: null,
};

const Slice = createSlice({
  name: 'Bank',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchParty
      .addCase(fetchAllAccount.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllAccount.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
      })
      .addCase(fetchAllAccount.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // fetchBalanceStatement
      .addCase(fetchBalanceStatement.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchBalanceStatement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.balanceReport = action.payload;
      })
      .addCase(fetchBalanceStatement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // fetchCapitalReport
      .addCase(fetchAssetStatement.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAssetStatement.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assetReport = action.payload;
      })
      .addCase(fetchAssetStatement.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // createParty
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // fetchUserById
      .addCase(fetchAccountById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingIndex >= 0) {
          state.data[existingIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // updateUser
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // deleteUser
      .addCase(destroyAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(d => d.id !== action.payload);
      })
      .addCase(destroyAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      
  },
});

export default Slice.reducer;
