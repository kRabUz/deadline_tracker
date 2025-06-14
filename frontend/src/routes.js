import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { AuthPage } from './pages/AuthPage';

export const AppRoutes = ({ tasks, subjects, onTaskUpdate, onSubjectUpdate }) => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={
        <HomePage 
          initialTasks={tasks} 
          initialSubjects={subjects}
          onTaskUpdate={onTaskUpdate}
          onSubjectUpdate={onSubjectUpdate}
        />
      } />
      <Route path="/calendar" element={
        <CalendarPage 
          initialTasks={tasks} 
          subjects={subjects}
          onTaskUpdate={onTaskUpdate}
        />
      } />
    </Routes>
  );
};