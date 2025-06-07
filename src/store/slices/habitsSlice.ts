import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Habit } from '../../types/habit';
import api from '../../api/axios';

interface HabitsState {
  habits: Habit[];
  currentHabit: Habit | null;
  loading: boolean;
  error: string | null;
}

const initialState: HabitsState = {
  habits: [],
  currentHabit: null,
  loading: false,
  error: null,
};

export const fetchHabits = createAsyncThunk(
  'habits/fetchHabits',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<Habit[]>('/api/habits');
      return data;
    } catch {
      return rejectWithValue('Ошибка при загрузке привычек');
    }
  }
);

export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habit: Omit<Habit, 'id'>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Habit>('/api/habits', habit);
      return data;
    } catch {
      return rejectWithValue('Ошибка при создании привычки');
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async (habit: Habit, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Habit>(`/api/habits/${habit.id}`, habit);
      return data;
    } catch {
      return rejectWithValue('Ошибка при обновлении привычки');
    }
  }
);

export const toggleHabitCheck = createAsyncThunk(
  'habits/toggleHabitCheck',
  async ({ habitId, date }: { habitId: string; date: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<Habit>(`/api/habits/${habitId}/toggle`, { date });
      return data;
    } catch {
      return rejectWithValue('Ошибка при обновлении статуса привычки');
    }
  }
);

export const deleteHabitAsync = createAsyncThunk(
  'habits/deleteHabit',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/habits/${id}`);
      return id;
    } catch {
      return rejectWithValue('Ошибка при удалении привычки');
    }
  }
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    setCurrentHabit: (state, action: PayloadAction<Habit | null>) => {
      state.currentHabit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.push(action.payload);
      })
      .addCase(createHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.habits.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(updateHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleHabitCheck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleHabitCheck.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.habits.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.habits[index] = action.payload;
        }
      })
      .addCase(toggleHabitCheck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteHabitAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHabitAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = state.habits.filter(h => h.id !== action.payload);
      })
      .addCase(deleteHabitAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentHabit } = habitsSlice.actions;
export default habitsSlice.reducer; 