import api from './api';

export const fetchTasks = (completed) => 
  api.get('/tasks', { params: { completed } }).then(res => res.data);
export const createTask = (data) => api.post('/tasks', data).then(res => res.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(res => res.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const toggleTaskStatus = (id, isCompleted) => 
  api.patch(`/tasks/${id}/toggle`, { is_completed: isCompleted }).then(res => res.data);