import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    initialized: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(userData),
        initialized: true
      });
      
      // Перенаправляємо з /auth на головну, якщо користувач вже авторизований
      if (location.pathname === '/auth') {
        navigate('/', { replace: true });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        initialized: true
      });
      
      // Перенаправляємо на /auth, якщо користувач не авторизований і не на сторінці авторизації
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        initialized: true
      });
      navigate('/', { replace: true });
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, initialized: true }));
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      initialized: true
    });
    navigate('/auth', { replace: true });
  };

  return { 
    ...authState,
    login, 
    logout 
  };
};