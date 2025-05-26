import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskViewModal } from './TaskViewModal';

export const TasksManager = ({ 
  open,
  onClose,
  tasks,
  subjects,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const handleSubmit = (taskData) => {
    if (currentTask) {
      onUpdate(currentTask.id, taskData);
    } else {
      onCreate(taskData);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle>
          Управління завданнями
          <Button 
            variant="contained" 
            onClick={() => {
              setCurrentTask(null);
              setIsFormOpen(true);
            }}
            sx={{ float: 'right' }}
            disabled={subjects.length === 0}
          >
            Додати завдання
          </Button>
        </DialogTitle>
        <DialogContent>
          {subjects.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Спочатку додайте хоча б один предмет
            </Alert>
          )}
          <TaskList 
            tasks={tasks}
            subjects={subjects}
            onView={(task) => {
              setCurrentTask(task);
              setIsViewOpen(true);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрити</Button>
        </DialogActions>
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
      />
    </>
  );
};