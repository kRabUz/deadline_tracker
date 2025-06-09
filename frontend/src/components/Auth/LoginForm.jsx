import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Невірний логін або пароль');
    } finally {
      setLoading(false);
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
        disabled={loading}
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
        disabled={loading}
      />
      
      <Button
        fullWidth
        type="submit"
        variant="contained"
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Увійти'}
      </Button>
    </Box>
  );
};