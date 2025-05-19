import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
});

// Subjects API
export const fetchSubjects = async () => {
  try {
    const response = await api.get('/subjects');
    return response;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const createSubject = async (data) => {
  try {
    const response = await api.post('/subjects', data);
    return {
      ...response,
      data: {
        id: response.data.id,
        name: response.data.name || data.name // На випадок, якщо бекенд не повертає name
      }
    };
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const updateSubject = async (id, data) => {
  try {
    const response = await api.put(`/subjects/${id}`, data);
    return {
      ...response,
      data: {
        id: response.data.id,
        name: response.data.name || data.name // Додаємо резервне значення
      }
    };
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (id) => {
  try {
    const response = await api.delete(`/subjects/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Tasks API
export const fetchTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (data) => {
  try {
    const response = await api.post('/tasks', data);
    return {
      ...response,
      data: {
        id: response.data.id,
        task_name: response.data.task_name || data.task_name,
        subject_id: response.data.subject_id || data.subject_id,
        priority: response.data.priority || data.priority || 'Low',
        difficulty: response.data.difficulty || data.difficulty || 'Medium',
        deadline: response.data.deadline || data.deadline
      }
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}; 

export const updateTask = async (id, data) => {
  try {
    const response = await api.put(`/tasks/${id}`, data);
    return {
      ...response,
      data: {
        id: response.data.id,
        task_name: response.data.task_name || data.task_name,
        subject_id: response.data.subject_id || data.subject_id,
        priority: response.data.priority || data.priority || 'Low',
        difficulty: response.data.difficulty || data.difficulty || 'Medium',
        deadline: response.data.deadline || data.deadline
      }
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export default api;