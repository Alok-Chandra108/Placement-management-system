import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as driveApi from '../../api/driveApi';

// Async thunks
export const getDrives = createAsyncThunk(
  'drives/getAll',
  async (params, thunkAPI) => {
    try {
      return await driveApi.fetchDrives(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getDriveById = createAsyncThunk(
  'drives/getOne',
  async (id, thunkAPI) => {
    try {
      return await driveApi.fetchDriveById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  drives: [],
  currentDrive: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const driveSlice = createSlice({
  name: 'drives',
  initialState,
  reducers: {
    resetDriveState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentDrive: (state) => {
      state.currentDrive = null;
    },
    clearDrives: (state) => {
      state.drives = [];
      state.currentDrive = null;
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // getDrives
      .addCase(getDrives.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDrives.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drives = action.payload.data;
      })
      .addCase(getDrives.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // getDriveById
      .addCase(getDriveById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDriveById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDrive = action.payload.data;
      })
      .addCase(getDriveById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetDriveState, clearCurrentDrive, clearDrives } = driveSlice.actions;
export default driveSlice.reducer;
