import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ukLocale from '@fullcalendar/core/locales/uk'; // Додаємо українську локаль
import { useTheme, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TaskViewModal, TaskForm } from '../components/Tasks';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTasks } from '../hooks/useTasks';

export const CalendarPage = ({ initialTasks = [], subjects = [], onTaskUpdate }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTaskStatus
  } = useTasks(initialTasks, onTaskUpdate);

  const [selectedTask, setSelectedTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState(null);

  const getPriorityColor = (priority, isCompleted) => {
    const baseColors = {
      'High': '#f44336', // Яскраво-червоний
      'Low': '#4caf50'   // Яскраво-зелений
    };
    
    const fadedColors = {
      'High': '#ef9a9a', // Блідо-червоний
      'Low': '#a5d6a7'   // Блідо-зелений
    };

    return isCompleted ? fadedColors[priority] : baseColors[priority];
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.task_name || 'Без назви',
    start: task.deadline,
    allDay: true,
    color: getPriorityColor(task.priority || 'Low', task.is_completed),
    extendedProps: { ...task },
    textColor: '#ffffff',
    classNames: [
      task.is_completed ? 'completed-event' : '',
      'clickable-event'
    ].filter(Boolean)
  }));

  const calendarStyles = `
      .clickable-event {
        cursor: pointer;
        border: none;
        font-weight: 500;
        transition: all 0.2s;
      }
      .clickable-event:hover {
        transform: scale(1.02);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      .completed-event {
        opacity: 0.7;
        position: relative;
      }
      .completed-event::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 2px;
        background: #ffffff;
        transform: translateY(-50%);
      }
      .fc .fc-toolbar-title {
      text-transform: capitalize;
      }
      .fc-col-header-cell {
        text-transform: capitalize;
      }
      .fc-event-title {
        display: inline-block;
        position: relative;
        z-index: 1;
      }
    `;

  const handleEventClick = (clickInfo) => {
    setSelectedTask(clickInfo.event.extendedProps);
    setViewModalOpen(true);
    setError(null);
  };

  const handleEdit = () => {
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleSubmitEdit = async (taskData) => {
    try {
      if (taskData.deadline && typeof taskData.deadline === 'string') {
        taskData.deadline = new Date(taskData.deadline).toISOString().split('T')[0];
      }

      const updatedTask = await updateTask(selectedTask.id, taskData);
      
      if (updatedTask) {
        setEditModalOpen(false);
        setViewModalOpen(false);
        setSelectedTask(updatedTask);
        setError(null);
        
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.refetchEvents();
        }
      }
      setEditModalOpen(false);
    } catch (error) {
      console.error('Помилка оновлення:', error);
      setError(error.message || 'Помилка оновлення завдання');
    }
  };

  const handleDelete = () => {
    setViewModalOpen(false);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(selectedTask.id);
      setDeleteConfirmOpen(false);
      setError(null);
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.response?.data?.error || error.message || 'Помилка видалення');
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      await toggleTaskStatus(taskId, isCompleted);
      setSelectedTask(prev => prev ? {...prev, is_completed: isCompleted} : null);
      setError(null);
    } catch (error) {
      console.error('Toggle error:', error);
      setError(error.response?.data?.error || error.message || 'Помилка зміни статусу');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <style>{calendarStyles}</style>
      
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        На головну
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {typeof error === 'string' ? error : 'Сталася помилка'}
        </Alert>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="auto"
        locales={[ukLocale]}
        locale="uk"
        buttonText={{
          today: 'Сьогодні',
          month: 'Місяць',
          week: 'Тиждень',
          day: 'День',
          list: 'Список'
        }}
        titleFormat={{
          month: 'long',
          year: 'numeric'
        }}
        dayHeaderFormat={{
          weekday: 'long'
        }}
      />

      <TaskViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        task={selectedTask}
        subjects={subjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
      />

      {selectedTask && (
        <TaskForm
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSubmitEdit}
          task={selectedTask}
          subjects={subjects}
        />
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Підтвердити видалення</DialogTitle>
        <DialogContent>
          Ви впевнені, що хочете видалити завдання "{selectedTask?.task_name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Скасувати</Button>
          <Button 
            onClick={confirmDelete} 
            color="error"
            variant="contained"
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};