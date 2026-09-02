import { createSlice } from '@reduxjs/toolkit';
import { UserState } from './userTypes';
import { fetchUsers, createUser, fetchUserById, updateUser, deleteUser, updateProfileWithFile } from './userThunks';



const initialState: UserState = {
  data: [],
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to fetch users';
      })

      // createUser
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to create user';
      })

      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(user => user.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update user';
      })

      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(user => user.id === action.payload.id);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to update user';
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to delete user';
      })

      .addCase(updateProfileWithFile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const existingUserIndex = state.data.findIndex(user => user.id === action.payload.profile?.userId);
        if (existingUserIndex >= 0) {
          state.data[existingUserIndex].profile = action.payload.profile;
        } else {
          state.data.push(action.payload);
        }
        console.log("action.payment: ", action.payload);
      })
      .addCase(updateProfileWithFile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to delete user';
      })

      // fetchProfileById
      // .addCase(fetchProfile.fulfilled, (state, action) => {
      //   state.status = 'succeeded';
      //   state.profile = action.payload;
      // })
      // .addCase(fetchProfile.rejected, (state, action) => {
      //   state.status = 'failed';
      //   state.error = action.payload || action.error.message || 'Failed to update user';
      // })
      
  },
});

export default userSlice.reducer;
