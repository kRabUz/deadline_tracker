import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '@mui/material';
import { TaskViewModal } from '../components/Tasks/TaskViewModal';

export const CalendarPage = ({ tasks = [] }) => {
  const theme = useTheme();
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Функція для отримання кольору за пріоритетом
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': 
        return theme.palette.error.main;
      case 'Medium':
        return theme.palette.warning.main;
      case 'Low':
      default:
        return theme.palette.success.main;
    }
  };

  // Форматуємо завдання для календаря
  const events = tasks.map(task => ({
    id: task.id,
    title: task.task_name || 'Без назви',
    start: task.deadline,
    allDay: true,
    color: getPriorityColor(task.priority || 'Low'), // Використовуємо функцію
    extendedProps: {
      ...task
    }
  }));

  const handleEventClick = (clickInfo) => {
    setSelectedTask(clickInfo.event.extendedProps);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '20px' }}>
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
      
      <TaskViewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
        subjects={[]} // Потрібно передати актуальний список предметів
        onEdit={() => {
          // Логіка редагування
          setModalOpen(false);
        }}
        onDelete={() => {
          // Логіка видалення
          setModalOpen(false);
        }}
      />
    </div>
  );
};