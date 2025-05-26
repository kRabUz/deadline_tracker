import React, { useState, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, CircularProgress, Alert, 
  Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SubjectForm, SubjectList, SubjectViewModal } from '../components/Subjects';
import { TaskForm, TaskList, TaskViewModal } from '../components/Tasks';
import { TaskViz } from '../components/Visualization';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';

export const HomePage = ({ initialTasks = [], initialSubjects = [], onTaskUpdate, onSubjectUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  
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

  // UI States
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [viewSubject, setViewSubject] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isViewSubjectOpen, setIsViewSubjectOpen] = useState(false);
  const [isViewTaskOpen, setIsViewTaskOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteSubjectConfirmOpen, setDeleteSubjectConfirmOpen] = useState(false);
  const [deleteTaskConfirmOpen, setDeleteTaskConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Subject Handlers
  const handleOpenSubjectDialog = useCallback((subject = null) => {
    setCurrentSubject(subject);
    setIsSubjectDialogOpen(true);
  }, []);

  const handleCloseSubjectDialog = useCallback(() => {
    setIsSubjectDialogOpen(false);
    setCurrentSubject(null);
  }, []);

  const handleSubmitSubject = useCallback(async (subjectData) => {
    try {
      if (currentSubject) {
        await updateSubject(currentSubject.id, subjectData);
      } else {
        await createSubject(subjectData);
      }
      setIsSubjectDialogOpen(false);
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [currentSubject, createSubject, updateSubject]);

  const handleRequestDeleteSubject = useCallback((id) => {
    setSubjectToDelete(id);
    setDeleteSubjectConfirmOpen(true);
  }, []);

  const handleDeleteSubject = useCallback(async () => {
    try {
      await deleteSubject(subjectToDelete);
      setDeleteSubjectConfirmOpen(false);
      setSnackbar({ open: true, message: 'Предмет видалено' });
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [subjectToDelete, deleteSubject]);

  // Task Handlers
  const handleOpenTaskDialog = useCallback((task = null) => {
    setCurrentTask(task);
    setIsTaskDialogOpen(true);
  }, []);

  const handleCloseTaskDialog = useCallback(() => {
    setIsTaskDialogOpen(false);
    setCurrentTask(null);
  }, []);

  const handleSubmitTask = useCallback(async (taskData) => {
    try {
      if (currentTask) {
        await updateTask(currentTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      setIsTaskDialogOpen(false);
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [currentTask, createTask, updateTask]);

  const handleRequestDeleteTask = useCallback((id) => {
    setTaskToDelete(id);
    setDeleteTaskConfirmOpen(true);
  }, []);

  const handleDeleteTask = useCallback(async () => {
    try {
      await deleteTask(taskToDelete);
      setDeleteTaskConfirmOpen(false);
      setSnackbar({ open: true, message: 'Завдання видалено' });
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
    }
  }, [taskToDelete, deleteTask]);

  // View Handlers
  const handleViewSubject = useCallback((subject) => {
    setViewSubject(subject);
    setIsViewSubjectOpen(true);
  }, []);

  const handleViewTask = useCallback((task) => {
    setViewTask(task);
    setIsViewTaskOpen(true);
  }, []);

  const handleCloseViewSubject = useCallback(() => {
    setIsViewSubjectOpen(false);
  }, []);

  const handleCloseViewTask = useCallback(() => {
    setIsViewTaskOpen(false);
  }, []);

  // UI Handlers
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleCloseError = useCallback(() => {
    setError('');
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Управління навчанням
      </Typography>

      <Button 
        component={Link}
        to="/calendar"
        variant="outlined"
        sx={{ mb: 3, mr: 2 }}
      >
        Перейти до календаря
      </Button>

      <TaskViz tasks={tasks} />

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Предмети" />
        <Tab label="Завдання" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseError}>
          {error}
        </Alert>
      )}

      {activeTab === 0 ? (
        <>
          <Button 
            variant="contained" 
            onClick={() => handleOpenSubjectDialog()}
            sx={{ mb: 3 }}
          >
            Додати предмет
          </Button>

          {subjectsLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 2 }}>
              <SubjectList 
                subjects={subjects} 
                onView={handleViewSubject}
                onEdit={handleOpenSubjectDialog}
                onDelete={handleRequestDeleteSubject}
              />
            </Paper>
          )}
        </>
      ) : (
        <>
          <Button 
            variant="contained" 
            onClick={() => handleOpenTaskDialog()}
            sx={{ mb: 3 }}
            disabled={subjects.length === 0}
          >
            Додати завдання
          </Button>

          {subjects.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Спочатку додайте хоча б один предмет
            </Alert>
          )}

          {tasksLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 2 }}>
              <TaskList 
                tasks={tasks} 
                subjects={subjects}
                onView={handleViewTask}
                onEdit={handleOpenTaskDialog}
                onDelete={handleRequestDeleteTask}
              />
            </Paper>
          )}
        </>
      )}

      {/* Модалки предметів */}
      <SubjectForm
        open={isSubjectDialogOpen}
        onClose={handleCloseSubjectDialog}
        onSubmit={handleSubmitSubject}
        editSubject={currentSubject}
      />

      <Dialog
        open={deleteSubjectConfirmOpen}
        onClose={() => setDeleteSubjectConfirmOpen(false)}
      >
        <DialogTitle>Підтвердити видалення предмету</DialogTitle>
        <DialogContent>
          Ви впевнені, що хочете видалити цей предмет? Всі пов'язані завдання також будуть видалені.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSubjectConfirmOpen(false)}>Скасувати</Button>
          <Button 
            onClick={handleDeleteSubject} 
            variant="contained" 
            color="error"
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалки завдань */}
      <TaskForm
        open={isTaskDialogOpen}
        onClose={handleCloseTaskDialog}
        onSubmit={handleSubmitTask}
        task={currentTask}
        subjects={subjects}
      />

      <Dialog
        open={deleteTaskConfirmOpen}
        onClose={() => setDeleteTaskConfirmOpen(false)}
      >
        <DialogTitle>Підтвердити видалення завдання</DialogTitle>
        <DialogContent>
          Ви впевнені, що хочете видалити це завдання?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTaskConfirmOpen(false)}>Скасувати</Button>
          <Button 
            onClick={handleDeleteTask} 
            variant="contained" 
            color="error"
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалки перегляду */}
      <SubjectViewModal
        open={isViewSubjectOpen}
        onClose={handleCloseViewSubject}
        subject={viewSubject}
        tasks={tasks}
        onEdit={() => {
          handleOpenSubjectDialog(viewSubject);
          handleCloseViewSubject();
        }}
        onDelete={() => {
          handleRequestDeleteSubject(viewSubject.id);
          handleCloseViewSubject();
        }}
      />

      <TaskViewModal
        open={isViewTaskOpen}
        onClose={handleCloseViewTask}
        task={viewTask}
        subjects={subjects}
        onEdit={() => {
          handleOpenTaskDialog(viewTask);
          handleCloseViewTask();
        }}
        onDelete={() => {
          handleRequestDeleteTask(viewTask.id);
          handleCloseViewTask();
        }}
      />

      {/* Сповіщення */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};