import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Habit } from '../../types/habit';

interface HabitDetailState {
  selectedHabit: Habit | null;
}

const initialState: HabitDetailState = {
  selectedHabit: null
};

const habitDetailSlice = createSlice({
  name: 'habitDetail',
  initialState,
  reducers: {
    setSelectedHabit: (state, action: PayloadAction<Habit | null>) => {
      state.selectedHabit = action.payload;
    },
    clearSelectedHabit: (state) => {
      state.selectedHabit = null;
    }
  }
});

export const { setSelectedHabit, clearSelectedHabit } = habitDetailSlice.actions;
export default habitDetailSlice.reducer; 