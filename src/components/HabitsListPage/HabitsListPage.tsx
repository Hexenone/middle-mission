import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabitAsync,
  toggleHabitCheck,
} from '../../store/slices/habitsSlice';
import type { Habit } from '../../types/habit';
import styles from './HabitsListPage.module.css';

const habitSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Выберите частоту' }),
  }),
});

type HabitFormData = z.infer<typeof habitSchema>;

const frequencyMap = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
} as const;

export const HabitsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { habits, loading, error } = useSelector((state: RootState) => state.habits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: 'daily',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  useEffect(() => {
    reset(editingHabit ? {
      name: editingHabit.name,
      description: editingHabit.description,
      frequency: editingHabit.frequency,
    } : {
      name: '',
      description: '',
      frequency: 'daily',
    });
  }, [editingHabit, reset]);

  const handleOpenModal = (habit?: Habit) => {
    setEditingHabit(habit || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
    reset();
  };

  const onSubmit = async (data: HabitFormData) => {
    try {
      if (editingHabit) {
        await dispatch(updateHabit({ ...editingHabit, ...data })).unwrap();
      } else {
        await dispatch(createHabit({ ...data, completedDates: [] })).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteHabitAsync(id)).unwrap();
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleToggleCheck = async (habitId: string, date: string) => {
    try {
      await dispatch(toggleHabitCheck({ habitId, date })).unwrap();
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const getLastFiveDays = () => Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  if (loading && !habits.length) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка привычек...</Typography>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4">Мои привычки</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Добавить привычку
        </Button>
      </div>

      {error && (
        <Alert severity="error" className={styles.error}>
          <Typography variant="subtitle1">Ошибка при загрузке привычек</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {!loading && !habits.length && !error && (
        <Alert severity="info" className={styles.error}>
          <Typography variant="subtitle1">У вас пока нет привычек</Typography>
          <Typography variant="body2">Нажмите кнопку "Добавить привычку", чтобы создать первую привычку</Typography>
        </Alert>
      )}

      <div className={habits.length === 1 ? styles.gridSingle : styles.grid}>
        {habits.map((habit) => (
          <Card key={habit.id} className={styles.card}>
            <CardContent className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <Typography variant="h6" className={styles.title}>
                  {habit.name}
                </Typography>
                <div>
                  <IconButton 
                    onClick={() => navigate(`/detail/${habit.id}`)} 
                    size="small"
                    title="Подробнее"
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleOpenModal(habit)} 
                    size="small"
                    title="Редактировать"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(habit.id)} 
                    size="small"
                    title="Удалить"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
              {habit.description && (
                <Typography color="textSecondary" className={styles.description}>
                  {habit.description}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                Частота: {frequencyMap[habit.frequency]}
              </Typography>
              <div className={styles.datesList}>
                <Typography variant="subtitle2" gutterBottom>
                  Последние 5 дней:
                </Typography>
                {getLastFiveDays().map((date) => (
                  <FormControlLabel
                    key={date}
                    control={
                      <Checkbox
                        id={`habit-${habit.id}-date-${date}`}
                        name={`habit-${habit.id}-date-${date}`}
                        checked={habit.completedDates.includes(date)}
                        onChange={() => handleToggleCheck(habit.id, date)}
                        size="small"
                      />
                    }
                    label={formatDate(date)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingHabit ? 'Редактировать привычку' : 'Добавить привычку'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="habit-name"
                  name="name"
                  label="Название"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="habit-description"
                  name="description"
                  label="Описание"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="habit-frequency"
                  name="frequency"
                  select
                  label="Частота"
                  fullWidth
                  margin="normal"
                  error={!!errors.frequency}
                  helperText={errors.frequency?.message}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Отмена</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {editingHabit ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};