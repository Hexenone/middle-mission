import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';
import type { Habit } from '../types/habit';

const getHabits = (): Habit[] => {
  const storedHabits = localStorage.getItem('habits');
  if (storedHabits) {
    return JSON.parse(storedHabits);
  }
  const initialHabits: Habit[] = [
    {
      id: '1',
      name: 'Читать книги',
      description: 'Читать минимум 30 минут в день',
      frequency: 'daily',
      completedDates: ['2024-03-20', '2024-03-21']
    }
  ];
  localStorage.setItem('habits', JSON.stringify(initialHabits));
  return initialHabits;
};

const saveHabits = (habits: Habit[]) => {
  localStorage.setItem('habits', JSON.stringify(habits));
};

export const handlers = [
  http.get('/api/habits', () => {
    const habits = getHabits();
    return HttpResponse.json(habits);
  }),

  http.post('/api/habits', async ({ request }) => {
    const newHabit = await request.json() as Omit<Habit, 'id'>;
    const habits = getHabits();
    const habit: Habit = {
      id: uuidv4(),
      ...newHabit,
      completedDates: []
    };
    habits.push(habit);
    saveHabits(habits);
    return HttpResponse.json(habit, { status: 201 });
  }),

  http.put('/api/habits/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Habit>;
    const habits = getHabits();
    const index = habits.findIndex(h => h.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    habits[index] = { ...habits[index], ...updates };
    saveHabits(habits);
    return HttpResponse.json(habits[index]);
  }),

  http.patch('/api/habits/:id/toggle', async ({ params, request }) => {
    const { id } = params;
    const { date } = await request.json() as { date: string };
    const habits = getHabits();
    const index = habits.findIndex(h => h.id === id);
    
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const habit = habits[index];
    if (habit.completedDates.includes(date)) {
      habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
      habit.completedDates.push(date);
    }
    
    saveHabits(habits);
    return HttpResponse.json(habit);
  }),

  http.delete('/api/habits/:id', ({ params }) => {
    const { id } = params;
    const habits = getHabits();
    const filteredHabits = habits.filter(h => h.id !== id);
    saveHabits(filteredHabits);
    return new HttpResponse(null, { status: 204 });
  })
]; 