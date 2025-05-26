import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TaskViewModal, TaskForm } from '../components/Tasks';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTasks } from '../hooks/useTasks';

export const CalendarPage = ({ initialTasks = [], subjects = [], onTaskUpdate }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const {
    tasks,
    updateTask,
    deleteTask
  } = useTasks(initialTasks, onTaskUpdate);

  const [selectedTask, setSelectedTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': default: return theme.palette.success.main;
    }
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.task_name || 'Без назви',
    start: task.deadline,
    allDay: true,
    color: getPriorityColor(task.priority || 'Low'),
    extendedProps: { ...task }
  }));

  const handleEventClick = (clickInfo) => {
    setSelectedTask(clickInfo.event.extendedProps);
    setViewModalOpen(true);
  };

  const handleEdit = () => {
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleSubmitEdit = async (taskData) => {
    try {
      await updateTask(selectedTask.id, taskData);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Помилка оновлення:', error);
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
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        На головну
      </Button>

      <FullCalendar
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
      />

      {/* Модалка перегляду */}
      <TaskViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        task={selectedTask}
        subjects={subjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Модалка редагування */}
      {selectedTask && (
        <TaskForm
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSubmitEdit}
          task={selectedTask}
          subjects={subjects}
        />
      )}

      {/* Підтвердження видалення */}
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