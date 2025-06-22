import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => {
  if (response.config.url === '/tasks' || response.config.url === '/subjects') {
    response.data = response.data || [];
  }
  return response;
}, error => {
  if (error.response?.status === 401) {
    logout();
  }
  return Promise.reject(error);
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
        name: response.data.name || data.name
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
        name: response.data.name || data.name
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

// TOPSIS API
export const getRecommendations = async (weights = [0.2, 0.2, 0.6], directions = ['max', 'max', 'min']) => {
  try {
    const weightsStr = weights.join(',');
    const directionsStr = directions.join(',');
    
    const response = await api.get('/tasks/recommendations', {
      params: { 
        weights: weightsStr,
        directions: directionsStr
      }
    });
    
    return {
      ...response,
      data: {
        parameters: response.data.parameters || {
          weights: weights,
          criteria_directions: directions,
          criteria_names: ["priority", "difficulty", "deadline"]
        },
        tasks: response.data.tasks || []
      }
    };
  } catch (error) {
    console.error('Error getting TOPSIS recommendations:', error);
    throw error;
  }
};

export default api;