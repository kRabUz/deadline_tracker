import { useState, useEffect, useCallback } from 'react';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  toggleTaskStatus
} from '../services/taskService';

export const useTasks = (initialTasks = [], onUpdate) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const loadTasks = useCallback(async (completed) => {
    try {
      setLoading(true);
      const data = await fetchTasks(completed);
      setTasks(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      onUpdate?.();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  const handleUpdate = useCallback(async (id, taskData) => {
    try {
      const updatedTask = await updateTask(id, taskData);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      onUpdate?.();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      onUpdate?.();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  const handleToggleComplete = useCallback(async (id, isCompleted) => {
    try {
      const updatedTask = await toggleTaskStatus(id, isCompleted);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      onUpdate?.();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask: handleCreate,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
    toggleTaskStatus: handleToggleComplete
  };
};