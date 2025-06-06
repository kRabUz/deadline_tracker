import React, { useState, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Button, CircularProgress, Alert, 
  Snackbar, Tabs, Tab 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { TaskViz } from '../components/Visualization';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { SubjectsManager } from '../components/Subjects/SubjectsManager';
import { TasksManager } from '../components/Tasks/TasksManager';
import { RecommendationsManager } from '../components/Tasks/RecommendationsManager';
import { RemindersManager } from '../components/Tasks/RemindersManager';

export const HomePage = ({ initialTasks = [], initialSubjects = [], onTaskUpdate, onSubjectUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Subjects
  const {
    subjects,
    loading: subjectsLoading,
    error: subjectsError,
    createSubject,
    updateSubject,
    deleteSubject,
    loadSubjects
  } = useSubjects(initialSubjects, onSubjectUpdate);

  // Tasks
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    loadTasks
  } = useTasks(initialTasks, onTaskUpdate);

  // Фільтрація нагадувань
  const reminderTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => {
      if (task.is_completed) return false;

      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      let reminderHours = 24; // Базовий час
      if (task.difficulty === "Medium") reminderHours += 24;
      if (task.difficulty === "Hard") reminderHours += 48;
      if (task.priority === "High") reminderHours += 48;

      return hoursUntilDeadline <= reminderHours;
    });
  }, [tasks]);

  const handleDeleteSubject = useCallback(async (id) => {
    try {
      await deleteSubject(id);
      setSnackbar({ open: true, message: 'Предмет успішно видалено' });
      loadTasks();
    } catch (err) {
      setError(`Помилка при видаленні предмету: ${err.response?.data?.error || err.message}`);
    }
  }, [deleteSubject, loadTasks]);

  const handleDeleteTask = useCallback(async (id) => {
    try {
      await deleteTask(id);
      setSnackbar({ open: true, message: 'Завдання успішно видалено' });
    } catch (err) {
      setError(`Помилка при видаленні завдання: ${err.response?.data?.error || err.message}`);
    }
  }, [deleteTask]);

  const handleToggleComplete = useCallback(async (taskId, isCompleted) => {
    try {
      await toggleTaskStatus(taskId, isCompleted);
      const statusText = isCompleted ? 'виконаним' : 'невиконаним';
      setSnackbar({ open: true, message: `Завдання позначено як ${statusText}` });
    } catch (err) {
      setError(`Помилка при зміні статусу: ${err.response?.data?.error || err.message}`);
    }
  }, [toggleTaskStatus]);

  const handleCloseError = useCallback(() => {
    setError('');
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Управління навчанням
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          component={Link}
          to="/calendar"
          variant="outlined"
        >
          Перейти до календаря
        </Button>
        <Button 
          variant="outlined"
          onClick={() => setSubjectsModalOpen(true)}
        >
          Мої предмети
        </Button>
        <Button 
          variant="outlined"
          onClick={() => setTasksModalOpen(true)}
          disabled={subjects.length === 0}
        >
          Мої завдання
        </Button>
        <Button 
          variant="outlined"
          onClick={() => setRecommendationsModalOpen(true)}
          disabled={tasks.length === 0}
        >
          Рекомендації
        </Button>
        <Button 
          variant="outlined"
          onClick={() => setRemindersOpen(true)}
          disabled={tasks.length === 0}
          sx={{ position: 'relative' }}
        >
          Нагадування
          {reminderTasks.length > 0 && (
            <Box sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              width: 16,
              height: 16,
              bgcolor: 'red',
              borderRadius: '50%'
            }} />
          )}
        </Button>
      </Box>

      {(subjectsLoading || tasksLoading) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {subjectsError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {subjectsError}
        </Alert>
      )}

      {tasksError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {tasksError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {error}
        </Alert>
      )}

      <TaskViz tasks={tasks} subjects={subjects} />

      <SubjectsManager
        open={subjectsModalOpen}
        onClose={() => setSubjectsModalOpen(false)}
        subjects={subjects}
        tasks={tasks}
        onCreate={createSubject}
        onUpdate={updateSubject}
        onDelete={handleDeleteSubject}
        loading={subjectsLoading}
      />

      <TasksManager
        open={tasksModalOpen}
        onClose={() => setTasksModalOpen(false)}
        tasks={tasks}
        subjects={subjects}
        onCreate={createTask}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        loading={tasksLoading}
      />

      <RecommendationsManager
        open={recommendationsModalOpen}
        onClose={() => setRecommendationsModalOpen(false)}
        tasks={tasks.filter(task => !task.is_completed)}
        subjects={subjects}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      <RemindersManager
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
        tasks={reminderTasks}
        subjects={subjects}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};