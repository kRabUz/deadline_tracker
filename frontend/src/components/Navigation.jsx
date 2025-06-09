import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} to="/">Головна</Button>
          <Button color="inherit" component={Link} to="/calendar">Календар</Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" onClick={logout}>Вийти</Button>
      </Toolbar>
    </AppBar>
  );
};