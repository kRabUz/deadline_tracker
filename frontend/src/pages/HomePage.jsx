import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SubjectForm, SubjectList, SubjectViewModal } from '../components/Subjects';
import { TaskForm, TaskList, TaskViewModal } from '../components/Tasks';
import { TaskViz } from '../components/Visualization';
import { 
  fetchSubjects, createSubject, updateSubject, deleteSubject,
  fetchTasks, createTask, updateTask, deleteTask
} from '../services/api';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState({ subjects: true, tasks: true });
  const [error, setError] = useState('');
  
  // Стани для предметів
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleteSubjectConfirmOpen, setDeleteSubjectConfirmOpen] = useState(false);
  
  // Стани для завдань
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteTaskConfirmOpen, setDeleteTaskConfirmOpen] = useState(false);
  
  // Стани для перегляду
  const [viewSubject, setViewSubject] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [isViewSubjectOpen, setIsViewSubjectOpen] = useState(false);
  const [isViewTaskOpen, setIsViewTaskOpen] = useState(false);
  
  // Стани для сповіщень
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Завантаження даних
  const loadSubjects = async () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    try {
      const res = await fetchSubjects();
      setSubjects(res.data.map(subj => ({
        id: subj.id,
        name: subj.name || 'Без назви'
      })));
      setError('');
    } catch (err) {
      setError('Не вдалося завантажити предмети');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const loadTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const res = await fetchTasks();
      setTasks(res.data.map(task => ({
        id: task.id,
        task_name: task.task_name || 'Без назви',
        subject_id: task.subject_id,
        priority: task.priority || 'Low',
        difficulty: task.difficulty || 'Medium',
        deadline: task.deadline || new Date().toISOString().split('T')[0],
        subject_name: subjects.find(s => s.id === task.subject_id)?.name
      })));
      setError('');
    } catch (err) {
      setError('Не вдалося завантажити завдання');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      loadTasks();
    }
  }, [subjects]);

  // Обробники для предметів
  const handleOpenSubjectDialog = (subject = null) => {
    setCurrentSubject(subject);
    setIsSubjectDialogOpen(true);
  };

const handleSubmitSubject = async (subjectData) => {
  try {
    const res = await (currentSubject 
      ? updateSubject(currentSubject.id, subjectData) 
      : createSubject(subjectData));
    
    const updatedSubject = {
      id: currentSubject ? currentSubject.id : res.data.id,
      name: subjectData.name
    };
    
    setSubjects(prev => currentSubject
      ? prev.map(s => s.id === currentSubject.id ? updatedSubject : s)
      : [...prev, updatedSubject]);
    
    setSnackbarMessage(`Предмет ${currentSubject ? 'оновлено' : 'додано'}`);
    setIsSubjectDialogOpen(false);
    setCurrentSubject(null); // Скидаємо поточний предмет
    setSnackbarOpen(true);
    loadTasks(); // Оновити завдання, оскільки вони залежать від предметів
  } catch (err) {
    setError(`Помилка: ${err.response?.data?.error || err.message}`);
  }
};

  const handleDeleteSubject = async () => {
    try {
      await deleteSubject(subjectToDelete);
      setSubjects(subjects.filter(subj => subj.id !== subjectToDelete));
      setSnackbarMessage('Предмет успішно видалено');
      setDeleteSubjectConfirmOpen(false);
      setSnackbarOpen(true);
      loadTasks(); // Оновити завдання після видалення предмету
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
      setDeleteSubjectConfirmOpen(false);
    }
  };

  // Обробники для завдань
  const handleOpenTaskDialog = (task = null) => {
    setCurrentTask(task);
    setIsTaskDialogOpen(true);
  };

const handleSubmitTask = async (taskData) => {
  try {
    const res = await (currentTask
      ? updateTask(currentTask.id, taskData)
      : createTask(taskData));
    
    const updatedTask = {
      id: currentTask ? currentTask.id : res.data.id,
      task_name: taskData.task_name,
      subject_id: taskData.subject_id,
      subject_name: subjects.find(s => s.id === taskData.subject_id)?.name,
      priority: taskData.priority || 'Low',
      difficulty: taskData.difficulty || 'Medium',
      deadline: taskData.deadline
    };
    
    setTasks(prev => currentTask
      ? prev.map(t => t.id === currentTask.id ? updatedTask : t)
      : [...prev, updatedTask]);
    
    setSnackbarMessage(`Завдання ${currentTask ? 'оновлено' : 'додано'}`);
    setIsTaskDialogOpen(false);
    setCurrentTask(null); // Скидаємо поточне завдання
    setSnackbarOpen(true);
  } catch (err) {
    setError(`Помилка: ${err.response?.data?.error || err.message}`);
  }
};

  const handleDeleteTask = async () => {
    try {
      await deleteTask(taskToDelete);
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setSnackbarMessage('Завдання успішно видалено');
      setDeleteTaskConfirmOpen(false);
      setSnackbarOpen(true);
    } catch (err) {
      setError(`Помилка: ${err.response?.data?.error || err.message}`);
      setDeleteTaskConfirmOpen(false);
    }
  };

  const handleCloseSubjectDialog = () => {
    setIsSubjectDialogOpen(false);
    setCurrentSubject(null); // Скидаємо поточний предмет
  };

  const handleCloseTaskDialog = () => {
    setIsTaskDialogOpen(false);
    setCurrentTask(null); // Скидаємо поточне завдання
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Предмети" />
        <Tab label="Завдання" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
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

          {loading.subjects ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 2 }}>
              <SubjectList 
                subjects={subjects} 
                onView={(subject) => {
                  setViewSubject(subject);
                  setIsViewSubjectOpen(true);
                }}
                onEdit={handleOpenSubjectDialog}
                onDelete={(id) => {
                  setSubjectToDelete(id);
                  setDeleteSubjectConfirmOpen(true);
                }}
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

          {loading.tasks ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 2 }}>
              <TaskList 
                tasks={tasks} 
                subjects={subjects}
                onView={(task) => {
                  setViewTask(task);
                  setIsViewTaskOpen(true);
                }}
                onEdit={handleOpenTaskDialog}
                onDelete={(id) => {
                  setTaskToDelete(id);
                  setDeleteTaskConfirmOpen(true);
                }}
              />
            </Paper>
          )}
        </>
      )}

      {/* Діалоги для предметів */}
      <SubjectForm
        open={isSubjectDialogOpen}
        onClose={handleCloseSubjectDialog}  // Замінити стару функцію на нову
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

      {/* Діалоги для завдань */}
      <TaskForm
        open={isTaskDialogOpen}
        onClose={handleCloseTaskDialog}  // Замінити стару функцію на нову
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
        onClose={() => setIsViewSubjectOpen(false)}
        subject={viewSubject}
        tasks={tasks}
        onEdit={() => {
          handleOpenSubjectDialog(viewSubject);
          setIsViewSubjectOpen(false);
        }}
        onDelete={() => {
          setSubjectToDelete(viewSubject.id);
          setDeleteSubjectConfirmOpen(true);
          setIsViewSubjectOpen(false);
        }}
      />

      <TaskViewModal
        open={isViewTaskOpen}
        onClose={() => setIsViewTaskOpen(false)}
        task={viewTask}
        subjects={subjects}
        onEdit={() => {
          handleOpenTaskDialog(viewTask);
          setIsViewTaskOpen(false);
        }}
        onDelete={() => {
          setTaskToDelete(viewTask.id);
          setDeleteTaskConfirmOpen(true);
          setIsViewTaskOpen(false);
        }}
      />

      {/* Сповіщення */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};