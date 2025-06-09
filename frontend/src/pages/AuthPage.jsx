import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import { LoginForm, RegisterForm } from '../components/Auth';

export const AuthPage = () => {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleAuthSuccess = () => {
    navigate('/'); // Додаткове перенаправлення
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Study Planner
        </Typography>
        
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Вхід" />
          <Tab label="Реєстрація" />
        </Tabs>
        
        {tab === 0 ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} />
        )}
      </Paper>
    </Box>
  );
};