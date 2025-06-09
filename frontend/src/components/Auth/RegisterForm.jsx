import React, { useState } from 'react';
import { Button, TextField, Box, Alert } from '@mui/material';
import { register } from '../../services/authService';

export const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      setError('Паролі не співпадають');
      return;
    }

    try {
      await register(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка реєстрації');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        fullWidth
        label="Ім'я користувача"
        name="username"
        value={formData.username}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Пароль"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Підтвердіть пароль"
        name="confirm_password"
        type="password"
        value={formData.confirm_password}
        onChange={handleChange}
        margin="normal"
        required
      />
      
      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={{ mt: 3 }}
      >
        Зареєструватися
      </Button>
    </Box>
  );
};