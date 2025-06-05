import React, { useState, useCallback } from 'react';
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
import { RecommendationsManager } from '../components/Tasks/RecommendationsManager'; // Імпортуємо новий компонент

export const HomePage = ({ initialTasks = [], initialSubjects = [], onTaskUpdate, onSubjectUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false); // Новий стан для Recommendations
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

  // Tasks with toggle complete functionality
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

  const handleDeleteSubject = useCallback(async (id) => {
    try {
      await deleteSubject(id);
      setSnackbar({ open: true, message: 'Предмет успішно видалено' });
      loadTasks(); // Refresh tasks after subject deletion
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

      {/* Додано новий RecommendationsManager */}
      <RecommendationsManager
        open={recommendationsModalOpen}
        onClose={() => setRecommendationsModalOpen(false)}
        tasks={tasks.filter(task => !task.is_completed)} // Тільки активні завдання
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