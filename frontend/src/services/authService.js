import api from './api';

export const login = async (credentials) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
  
  const response = await api.post('/login', credentials);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.user_id,
      username: response.data.username
    }));
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  
  return {
    user: {
      id: response.data.user_id,
      username: response.data.username
    }
  };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
  api.interceptors.request.use(config => {
    config.params = config.params || {};
    config.params['noCache'] = Date.now();
    return config;
  });
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  return response.data;
};