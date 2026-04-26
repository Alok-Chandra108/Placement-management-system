import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import driveReducer from '../features/drives/driveSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    drives: driveReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
