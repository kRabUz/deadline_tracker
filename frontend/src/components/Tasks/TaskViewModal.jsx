import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Stack,
  Checkbox,
  FormControlLabel
} from '@mui/material';

export const formatDate = (dateString) => {
  if (!dateString) return 'Не вказано';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Невірна дата' : date.toLocaleDateString('uk-UA');
  } catch {
    return 'Невірна дата';
  }
};

export const TaskViewModal = ({ 
  open, 
  onClose, 
  task, 
  subjects = [], 
  onEdit, 
  onDelete,
  onToggleComplete 
}) => {
  const [localTask, setLocalTask] = useState(task);
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const priorityTranslations = {
    'Low': 'Низький',
    'High': 'Високий'
  };

  const difficultyTranslations = {
    'Easy': 'Легка',
    'Medium': 'Середня',
    'Hard': 'Складна'
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Невідомий предмет';
  };

  const handleToggleComplete = async (event) => {
    if (!localTask) return;
    
    setIsUpdating(true);
    try {
      const newStatus = event.target.checked;
      setLocalTask({
        ...localTask,
        is_completed: newStatus
      });
      await onToggleComplete(localTask.id, newStatus);
    } catch (error) {
      setLocalTask({
        ...localTask,
        is_completed: !event.target.checked
      });
      console.error("Помилка при зміні статусу завдання:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!localTask) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: localTask.is_completed ? 'success.main' : 'primary.main',
        color: 'white',
        transition: 'background-color 0.3s ease'
      }}>
        {localTask.task_name || 'Без назви'}
        {localTask.is_completed && (
          <Typography variant="caption" display="block" sx={{ color: 'white' }}>
            (Виконано)
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Предмет:</Typography>
              <Typography variant="body1">{getSubjectName(localTask.subject_id)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Пріоритет:</Typography>
              <Typography variant="body1">{priorityTranslations[localTask.priority] || 'Низький'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Складність:</Typography>
              <Typography variant="body1">{difficultyTranslations[localTask.difficulty] || 'Середня'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Дедлайн:</Typography>
              <Typography variant="body1">{formatDate(localTask.deadline)}</Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={localTask.is_completed || false}
              onChange={handleToggleComplete}
              color="success"
              disabled={isUpdating}
            />
          }
          label={
            <Typography variant="body1">
              {localTask.is_completed ? 'Виконано' : 'Не виконано'}
            </Typography>
          }
          sx={{ 
            mr: 0,
            '& .Mui-checked': {
              color: 'success.main'
            }
          }}
        />

        <Box>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Закрити
          </Button>
          <Button 
            onClick={() => {
              onEdit();
              onClose();
            }}
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Редагувати
          </Button>
          <Button 
            onClick={() => {
              onDelete();
              onClose();
            }}
            variant="contained"
            color="error"
          >
            Видалити
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};