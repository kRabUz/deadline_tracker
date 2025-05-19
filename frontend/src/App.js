import { useState, useEffect } from 'react';
import { fetchTasks } from './services/api';
import { AppRoutes } from './routes';

function App() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetchTasks();
        setTasks(res.data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };
    loadTasks();
  }, []);

  return <AppRoutes tasks={tasks} />;
}

export default App;