import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  deleteHabitAsync,
  setCurrentHabit,
  toggleHabitCheck,
  fetchHabits
} from '../../store/slices/habitsSlice';
import { clearSelectedHabit } from '../../store/slices/habitDetailSlice';
import {
  Button,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  IconButton,
  Alert,
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
  
  const { habits, loading, error } = useAppSelector(state => state.habits);
  const habit = habits.find(h => h.id === id);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  useEffect(() => {
    if (habit) {
      dispatch(setCurrentHabit(habit));
    }
    return () => {
      dispatch(clearSelectedHabit());
    };
  }, [dispatch, habit]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton onClick={() => navigate('/')} className={styles.backButton}>
            <ArrowBackIcon />
          </IconButton>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        </div>

        <Paper className={styles.content}>
          <div className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
          </div>

          <div className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
          </div>

          <div className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.datesList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonCheckbox}`} />
              ))}
            </div>
          </div>
        </Paper>

        <div className={styles.deleteButton}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} style={{ width: '150px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loading}>
        <Alert severity="error">
          <Typography variant="subtitle1">Ошибка при загрузке привычки</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </div>
    );
  }

  if (!habit) {
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

  const handleDelete = async () => {
    await dispatch(deleteHabitAsync(habit.id));
    navigate('/');
  };

  const handleToggleComplete = async (date: string) => {
    await dispatch(toggleHabitCheck({ habitId: habit.id, date }));
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconButton onClick={() => navigate('/')} className={styles.backButton}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className={styles.title}>{habit.name}</Typography>
      </div>

      <Paper className={styles.content}>
        {habit.description && (
          <div className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              <DescriptionIcon fontSize="small" />
              Описание
            </Typography>
            <div className={styles.sectionContent}>
              <Typography variant="body1" className={styles.description}>
                {habit.description}
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
            <Typography variant="body1">{frequencyMap[habit.frequency]}</Typography>
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
                      checked={habit.completedDates.includes(date)}
                      onChange={() => handleToggleComplete(date)}
                      size="small"
                    />
                  }
                  label={formatDate(date)}
                />
              </div>
            ))}
          </div>
        </div>
      </Paper>

      <div className={styles.deleteButton}>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Удалить привычку
        </Button>
      </div>
    </div>
  );
};

export default HabitDetailPage;