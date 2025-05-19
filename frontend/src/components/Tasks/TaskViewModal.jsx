import React from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Box, Typography, 
  Divider, Stack
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
  onDelete 
}) => {
  if (!task) return null;

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        {task.task_name || 'Без назви'}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Предмет:</Typography>
              <Typography variant="body1">{getSubjectName(task.subject_id)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Пріоритет:</Typography>
              <Typography variant="body1">{priorityTranslations[task.priority] || 'Низький'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Складність:</Typography>
              <Typography variant="body1">{difficultyTranslations[task.difficulty] || 'Середня'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <Typography variant="subtitle1" sx={{ minWidth: 120, fontWeight: 'bold' }}>Дедлайн:</Typography>
              <Typography variant="body1">{formatDate(task.deadline)}</Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
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
      </DialogActions>
    </Dialog>
  );
};