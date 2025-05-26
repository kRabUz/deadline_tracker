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

export const HomePage = ({ initialTasks = [], initialSubjects = [], onTaskUpdate, onSubjectUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Subjects
  const {
    subjects,
    loading: subjectsLoading,
    createSubject,
    updateSubject,
    deleteSubject
  } = useSubjects(initialSubjects, onSubjectUpdate);

  // Tasks
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask
  } = useTasks(initialTasks, onTaskUpdate);

  const handleDeleteSubject = useCallback(async (id) => {
    try {
      await deleteSubject(id);
      setSnackbar({ open: true, message: 'Предмет видалено' });
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [deleteSubject]);

  const handleDeleteTask = useCallback(async (id) => {
    try {
      await deleteTask(id);
      setSnackbar({ open: true, message: 'Завдання видалено' });
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [deleteTask]);

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
      </Box>

      <TaskViz tasks={tasks} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <SubjectsManager
        open={subjectsModalOpen}
        onClose={() => setSubjectsModalOpen(false)}
        subjects={subjects}
        tasks={tasks}
        onCreate={createSubject}
        onUpdate={updateSubject}
        onDelete={handleDeleteSubject}
      />

      <TasksManager
        open={tasksModalOpen}
        onClose={() => setTasksModalOpen(false)}
        tasks={tasks}
        subjects={subjects}
        onCreate={createTask}
        onUpdate={updateTask}
        onDelete={handleDeleteTask}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};