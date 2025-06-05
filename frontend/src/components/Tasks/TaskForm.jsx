import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, FormControl, InputLabel, Select,
  Box
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

const emptyFormData = {
  task_name: '',
  subject_id: '',
  priority: '',
  difficulty: '',
  deadline: new Date()
};

export const TaskForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  task, 
  subjects 
}) => {
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          task_name: task.task_name,
          subject_id: task.subject_id,
          priority: task.priority,
          difficulty: task.difficulty,
          deadline: new Date(task.deadline)
        });
      } else {
        setFormData({
          ...emptyFormData,
          subject_id: subjects.length > 0 ? subjects[0].id : ''
        });
      }
    }
  }, [open, task, subjects]);

  const handleSubmit = () => {
    if (!formData.task_name.trim() || !formData.subject_id) {
      return;
    }

    onSubmit({
      ...formData,
      deadline: formData.deadline.toISOString().split('T')[0]
    });
  };

  const handleClose = () => {
    setFormData(emptyFormData);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{task ? 'Редагувати завдання' : 'Додати завдання'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 1 }}>
            <TextField
              label="Назва завдання"
              fullWidth
              value={formData.task_name}
              onChange={(e) => setFormData({...formData, task_name: e.target.value})}
              required
              variant="outlined"
              margin="normal"
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel>Предмет *</InputLabel>
              <Select
                value={formData.subject_id}
                onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                disabled={subjects.length === 0}
                label="Предмет"
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 1 }}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Пріоритет</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                label="Пріоритет"
              >
                <MenuItem value="Low">Низький</MenuItem>
                <MenuItem value="High">Високий</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 1 }}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Складність</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                label="Складність"
              >
                <MenuItem value="Easy">Легка</MenuItem>
                <MenuItem value="Medium">Середня</MenuItem>
                <MenuItem value="Hard">Складна</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 1 }}>
            <DesktopDatePicker
              label="Дедлайн"
              value={formData.deadline}
              onChange={(newValue) => setFormData({...formData, deadline: newValue || new Date()})}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  variant="outlined"
                  margin="normal"
                  required
                />
              )}
              minDate={new Date()}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={!formData.task_name.trim() || !formData.subject_id}
          >
            {task ? 'Оновити' : 'Додати'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};