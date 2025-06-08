import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  deleteHabitAsync,
  toggleHabitCheck,
  fetchHabits
} from '../../store/slices/habitsSlice';
import { 
  setSelectedHabit, 
  clearSelectedHabit,
  setLoading,
  setError 
} from '../../store/slices/habitDetailSlice';
import {
  Button,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import styles from './HabitDetailPage.module.css';

const frequencyMap = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
} as const;

const HabitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedHabit, isLoading, error } = useAppSelector(state => state.habitDetail);

  const loadHabit = useCallback(async () => {
    if (!id) return;
    
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const habits = await dispatch(fetchHabits()).unwrap();
      const habit = habits.find(h => h.id === id);
      
      if (habit) {
        dispatch(setSelectedHabit(habit));
      } else {
        dispatch(setError('Привычка не найдена'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Произошла ошибка'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    loadHabit();
    return () => {
      dispatch(clearSelectedHabit());
    };
  }, [loadHabit, dispatch]);

  const handleDelete = async () => {
    if (!selectedHabit) return;
    
    try {
      dispatch(setLoading(true));
      await dispatch(deleteHabitAsync(selectedHabit.id));
      navigate('/');
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Ошибка при удалении привычки'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleToggleComplete = async (date: string) => {
    if (!selectedHabit) return;
    
    try {
      dispatch(setLoading(true));
      await dispatch(toggleHabitCheck({ habitId: selectedHabit.id, date }));
      const habits = await dispatch(fetchHabits()).unwrap();
      const updatedHabit = habits.find(h => h.id === selectedHabit.id);
      if (updatedHabit) {
        dispatch(setSelectedHabit(updatedHabit));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Ошибка при обновлении статуса'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton onClick={() => navigate('/')} className={styles.backButton}>
            <ArrowBackIcon />
          </IconButton>
          <CircularProgress size={24} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton onClick={() => navigate('/')} className={styles.backButton}>
            <ArrowBackIcon />
          </IconButton>
          <Alert severity="error" sx={{ width: '100%' }}>
            <Typography variant="subtitle1">Ошибка</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </div>
      </div>
    );
  }

  if (!selectedHabit) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton onClick={() => navigate('/')} className={styles.backButton}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Привычка не найдена</Typography>
        </div>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Привычка не найдена</Typography>
          <Typography variant="body2">Возможно, она была удалена или вы перешли по неверной ссылке</Typography>
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconButton onClick={() => navigate('/')} className={styles.backButton}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className={styles.title}>{selectedHabit.name}</Typography>
      </div>

      <Paper className={styles.content}>
        {selectedHabit.description && (
          <div className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              <DescriptionIcon fontSize="small" />
              Описание
            </Typography>
            <div className={styles.sectionContent}>
              <Typography variant="body1" className={styles.description}>
                {selectedHabit.description}
              </Typography>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            <CalendarIcon fontSize="small" />
            Частота
          </Typography>
          <div className={styles.sectionContent}>
            <Typography variant="body1">{frequencyMap[selectedHabit.frequency]}</Typography>
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            <CheckCircleIcon fontSize="small" />
            Выполненные дни
          </Typography>
          <div className={styles.datesList}>
            {lastFiveDays.map(date => (
              <div key={date} className={styles.dateItem}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id={`habit-detail-date-${date}`}
                      name={`habit-detail-date-${date}`}
                      checked={selectedHabit.completedDates.includes(date)}
                      onChange={() => handleToggleComplete(date)}
                      size="small"
                      disabled={isLoading}
                    />
                  }
                  label={formatDate(date)}
                />
              </div>
            ))}
          </div>
        </div>
      </Paper>

      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={handleDelete}
        disabled={isLoading}
        className={styles.deleteButton}
      >
        Удалить привычку
      </Button>
    </div>
  );
};

export default HabitDetailPage;