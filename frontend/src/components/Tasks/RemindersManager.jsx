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
            <TaskList
              tasks={tasks}
              subjects={subjects}
              onView={(task) => {
                setCurrentTask(task);
                setIsViewOpen(true);
              }}
              onToggleComplete={onToggleComplete}
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