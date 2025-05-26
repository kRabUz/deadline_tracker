import { useState, useEffect, useCallback } from 'react'; // Додано useEffect
import { 
  fetchSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../services/subjectService';

export const useSubjects = (initialSubjects = [], onUpdate) => {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Додано ефект для синхронізації стану
  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (subjectData) => {
    try {
      const newSubject = await createSubject(subjectData);
      setSubjects(prev => [...prev, newSubject]);
      onUpdate?.();
      return newSubject;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  const handleUpdate = useCallback(async (id, subjectData) => {
    try {
      const updatedSubject = await updateSubject(id, subjectData);
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
      onUpdate?.();
      return updatedSubject;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
      onUpdate?.();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [onUpdate]);

  return {
    subjects,
    loading,
    error,
    loadSubjects,
    createSubject: handleCreate,
    updateSubject: handleUpdate,
    deleteSubject: handleDelete
  };
};