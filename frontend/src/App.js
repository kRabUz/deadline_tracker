import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { fetchTasks, fetchSubjects } from './services/api';
import { AppRoutes } from './routes';

function App() {
  const { isAuthenticated, initialized } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const [tasksRes, subjectsRes] = await Promise.all([
            fetchTasks(),
            fetchSubjects()
          ]);
          setTasks(tasksRes.data || []);
          setSubjects(subjectsRes.data || []);
        } catch (err) {
          console.error('Failed to load data:', err);
          setTasks([]);
          setSubjects([]);
        }
      };
      loadData();
    } else {
      setTasks([]);
      setSubjects([]);
    }
  }, [isAuthenticated]);

  const handleTaskUpdate = async () => {
    try {
      const tasksRes = await fetchTasks();
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to update tasks:', err);
    }
  };

  const handleSubjectUpdate = async () => {
    try {
      const subjectsRes = await fetchSubjects();
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Failed to update subjects:', err);
    }
  };

  return (
    <AppRoutes 
      tasks={tasks} 
      subjects={subjects} 
      onTaskUpdate={handleTaskUpdate}
      onSubjectUpdate={handleSubjectUpdate}
    />
  );
}

export default App;