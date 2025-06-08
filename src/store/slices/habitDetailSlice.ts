import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Habit } from '../../types/habit';

interface HabitDetailState {
  selectedHabit: Habit | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: HabitDetailState = {
  selectedHabit: null,
  isLoading: false,
  error: null
};

const habitDetailSlice = createSlice({
  name: 'habitDetail',
  initialState,
  reducers: {
    setSelectedHabit: (state, action: PayloadAction<Habit | null>) => {
      state.selectedHabit = action.payload;
      state.error = null;
    },
    clearSelectedHabit: (state) => {
      state.selectedHabit = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setSelectedHabit, 
  clearSelectedHabit,
  setLoading,
  setError 
} = habitDetailSlice.actions;

export default habitDetailSlice.reducer; 