import api from './api';

export const fetchTasks = () => api.get('/tasks').then(res => res.data);
export const createTask = (data) => api.post('/tasks', data).then(res => res.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(res => res.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);