import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Chip
} from '@mui/material';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskViewModal } from './TaskViewModal';

const getTaskUrgencyStyle = (task) => {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    return { 
      bgcolor: '#FFEBEE', // Червоний фон для прострочених
      borderLeft: '4px solid #F44336' 
    };
  }
  if (hoursLeft < 24) {
    return { 
      bgcolor: '#FFF3E0', // Жовтий фон для термінових
      borderLeft: '4px solid #FF9800' 
    };
  }
  if (task.priority === "High") {
    return { 
      bgcolor: '#E3F2FD', // Синій фон для високого пріоритету
      borderLeft: '4px solid #2196F3' 
    };
  }
  return {};
};

export const RemindersManager = ({ 
  open,
  onClose,
  tasks,
  subjects,
  onUpdate,
  onDelete,
  onToggleComplete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  // Модифікований TaskList з підсвічуванням
  const HighlightedTaskList = ({ tasks, ...props }) => {
    return (
      <TaskList 
        {...props}
        tasks={tasks.map(task => ({
          ...task,
          _style: getTaskUrgencyStyle(task) // Додаємо стилі до кожного завдання
        }))}
        rowProps={(task) => ({
          sx: task._style, // Застосовуємо стилі до рядка
        })}
      />
    );
  };

  const handleSubmit = (taskData) => {
    onUpdate(currentTask.id, taskData);
    setIsFormOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between">
            <Box>Нагадування</Box>
            <Button onClick={onClose}>Закрити</Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {tasks.length === 0 ? (
            <Alert severity="info">Немає завдань для нагадувань</Alert>
          ) : (
            <HighlightedTaskList
              tasks={tasks}
              subjects={subjects}
              onView={(task) => {
                setCurrentTask(task);
                setIsViewOpen(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        task={currentTask}
        subjects={subjects}
      />

      <TaskViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={currentTask}
        subjects={subjects}
        onEdit={() => {
          setIsFormOpen(true);
          setIsViewOpen(false);
        }}
        onDelete={(id) => {
          onDelete(id);
          setIsViewOpen(false);
        }}
        onToggleComplete={onToggleComplete}
      />
    </>
  );
};