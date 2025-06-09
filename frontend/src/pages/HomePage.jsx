import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Box, Button, CircularProgress, Alert, 
  Snackbar, Stack
} from '@mui/material';
import { TaskViz } from '../components/Visualization';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import { SubjectsManager } from '../components/Subjects/SubjectsManager';
import { TasksManager } from '../components/Tasks/TasksManager';
import { RecommendationsManager } from '../components/Tasks/RecommendationsManager';
import { RemindersManager } from '../components/Tasks/RemindersManager';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';

export const HomePage = ({ initialTasks = [], initialSubjects = [], onTaskUpdate, onSubjectUpdate }) => {
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState('');
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [localTasks, setLocalTasks] = useState([]);
  const [localSubjects, setLocalSubjects] = useState([]);

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

  // Синхронізація локального стану
  useEffect(() => {
    if (isAuthenticated) {
      setLocalTasks(tasks);
      setLocalSubjects(subjects);
    } else {
      setLocalTasks([]);
      setLocalSubjects([]);
    }
  }, [isAuthenticated, tasks, subjects]);

  // Фільтрація нагадувань
  const reminderTasks = useMemo(() => {
    if (!isAuthenticated) return [];
    
    const now = new Date();
    return localTasks.filter(task => {
      if (task.is_completed) return false;

      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      let reminderHours = 24;
      if (task.difficulty === "Medium") reminderHours += 24;
      if (task.difficulty === "Hard") reminderHours += 48;
      if (task.priority === "High") reminderHours += 48;

      return hoursUntilDeadline <= reminderHours;
    });
  }, [localTasks, isAuthenticated]);

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
    <>
      <Navigation />
      
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ flexGrow: 1 }}>
            <TaskViz tasks={localTasks} subjects={localSubjects} />
          </Box>
          
          <Stack spacing={2} sx={{ width: 200 }}>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => setSubjectsModalOpen(true)}
              disabled={!isAuthenticated}
            >
              Мої предмети
            </Button>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => setTasksModalOpen(true)}
              disabled={!isAuthenticated || localSubjects.length === 0}
            >
              Мої завдання
            </Button>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => setRecommendationsModalOpen(true)}
              disabled={!isAuthenticated || localTasks.length === 0}
            >
              Рекомендації
            </Button>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => setRemindersOpen(true)}
              disabled={!isAuthenticated || localTasks.length === 0}
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
          </Stack>
        </Stack>

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

        <SubjectsManager
          open={subjectsModalOpen}
          onClose={() => setSubjectsModalOpen(false)}
          subjects={localSubjects}
          tasks={localTasks}
          onCreate={createSubject}
          onUpdate={updateSubject}
          onDelete={handleDeleteSubject}
          loading={subjectsLoading}
        />

        <TasksManager
          open={tasksModalOpen}
          onClose={() => setTasksModalOpen(false)}
          tasks={localTasks}
          subjects={localSubjects}
          onCreate={createTask}
          onUpdate={updateTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          loading={tasksLoading}
        />

        <RecommendationsManager
          open={recommendationsModalOpen}
          onClose={() => setRecommendationsModalOpen(false)}
          tasks={localTasks.filter(task => !task.is_completed)}
          subjects={localSubjects}
          onUpdate={updateTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />

        <RemindersManager
          open={remindersOpen}
          onClose={() => setRemindersOpen(false)}
          tasks={reminderTasks}
          subjects={localSubjects}
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
    </>
  );
};