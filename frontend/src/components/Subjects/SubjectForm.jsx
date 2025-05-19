import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  FormControl,
  FormHelperText 
} from '@mui/material';

export const SubjectForm = ({ open, onClose, onSubmit, editSubject }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSubject) {
      setName(editSubject.name);
    } else {
      setName('');
    }
    setError('');
  }, [open, editSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Назва предмету обов\'язкова');
      return;
    }
    
    if (name.length > 100) {
      setError('Назва не може бути довшою за 100 символів');
      return;
    }

    onSubmit({ name });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editSubject ? 'Редагувати предмет' : 'Додати новий предмет'}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <TextField
              autoFocus
              margin="dense"
              label="Назва предмету"
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              error={!!error}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!name.trim()}
        >
          {editSubject ? 'Оновити' : 'Зберегти'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};