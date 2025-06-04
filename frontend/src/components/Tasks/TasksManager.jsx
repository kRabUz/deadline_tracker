import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  Box
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
  onDelete,
  onToggleComplete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Фільтруємо завдання в залежності від стану чекбоксу
  const filteredTasks = showAllTasks 
    ? tasks 
    : tasks.filter(task => !task.is_completed);

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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>Управління завданнями</Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={showAllTasks}
                    onChange={(e) => setShowAllTasks(e.target.checked)}
                    color="primary"
                  />
                }
                label="Показувати всі завдання"
                sx={{ mr: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={() => {
                  setCurrentTask(null);
                  setIsFormOpen(true);
                }}
                disabled={subjects.length === 0}
              >
                Додати завдання
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {subjects.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Спочатку додайте хоча б один предмет
            </Alert>
          )}
          <TaskList 
            tasks={filteredTasks}
            subjects={subjects}
            onView={(task) => {
              setCurrentTask(task);
              setIsViewOpen(true);
            }}
            onToggleComplete={onToggleComplete}
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
        onToggleComplete={onToggleComplete}
      />
    </>
  );
};