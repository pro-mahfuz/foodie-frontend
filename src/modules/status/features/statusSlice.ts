import { createSlice } from '@reduxjs/toolkit';
import { StatusState } from './statusTypes';
import { createStatus, fetchAllStatus, fetchStatusById, updateStatus, destroyStatus } from './statusThunks';



const initialState: StatusState = {
  data: [],
  status: 'idle',
  error: null,
};

const Slice = createSlice({
  name: 'Status',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchParty
      .addCase(fetchAllStatus.pending, (state) => {
          state.status = 'loading';
          state.error = null;
      })
      .addCase(fetchAllStatus.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.data = action.payload;
          //console.log("action.payload: ", action.payload);
      })
      .addCase(fetchAllStatus.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || null;
      })

      // createParty
      .addCase(createStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
      })
      .addCase(createStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // fetchUserById
      .addCase(fetchStatusById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStatusById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingIndex >= 0) {
          state.data[existingIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchStatusById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // updateUser
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(d => d.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      // deleteUser
      .addCase(destroyStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(d => d.id !== action.payload);
      })
      .addCase(destroyStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })

      
  },
});

export default Slice.reducer;
