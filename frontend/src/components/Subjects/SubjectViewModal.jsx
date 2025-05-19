import React from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Box, Typography,
  Divider
} from '@mui/material';

export const SubjectViewModal = ({ 
  open, 
  onClose, 
  subject, 
  tasks = [], 
  onEdit, 
  onDelete 
}) => {
  if (!subject) return null;

  // Підрахунок кількості завдань для цього предмету
  const tasksCount = tasks.filter(task => task.subject_id === subject.id).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" // Зменшили максимальну ширину
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2,
        fontSize: '1.2rem'
      }}>
        {subject.name || 'Без назви'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 1,
          mb: 2
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Кількість завдань:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            {tasksCount}
          </Typography>
        </Box>
        <Divider />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
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