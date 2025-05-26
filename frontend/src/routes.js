import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';

export const AppRoutes = ({ tasks, subjects, onTaskUpdate, onSubjectUpdate }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage 
            initialTasks={tasks} 
            initialSubjects={subjects}
            onTaskUpdate={onTaskUpdate}
            onSubjectUpdate={onSubjectUpdate}
          />
        } 
      />
      <Route 
        path="/calendar" 
        element={
          <CalendarPage 
            initialTasks={tasks} 
            subjects={subjects}
            onTaskUpdate={onTaskUpdate}
          />
        } 
      />
    </Routes>
  );
};