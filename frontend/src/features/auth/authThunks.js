import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as loginApi, logoutUser as logoutApi, refreshToken as refreshApi } from '../../api/authApi';
import { setCredentials, clearCredentials, setAccessToken } from './authSlice';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await loginApi(credentials);
      dispatch(
        setCredentials({
          user: data.data.user,
          accessToken: data.data.accessToken,
        })
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await logoutApi();
      dispatch(clearCredentials());
    } catch (error) {
      // Clear credentials even if API call fails
      dispatch(clearCredentials());
      return rejectWithValue(
        error.response?.data || { message: 'Logout failed' }
      );
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await refreshApi();
      dispatch(setAccessToken(data.data.accessToken));
      return data;
    } catch (error) {
      dispatch(clearCredentials());
      return rejectWithValue(
        error.response?.data || { message: 'Token refresh failed' }
      );
    }
  }
);
