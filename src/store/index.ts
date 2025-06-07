import { configureStore } from '@reduxjs/toolkit';
import habitsReducer from './slices/habitsSlice';
import habitDetailReducer from './slices/habitDetailSlice';

export const store = configureStore({
  reducer: {
    habits: habitsReducer,
    habitDetail: habitDetailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 