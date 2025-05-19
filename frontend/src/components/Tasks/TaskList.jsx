import React from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip
} from '@mui/material';
import { formatDate } from './TaskViewModal';

// Додаємо переклади для пріоритетів і складності
const priorityTranslations = {
  'Low': 'Низький',
  'High': 'Високий'
};

const difficultyTranslations = {
  'Easy': 'Легка',
  'Medium': 'Середня',
  'Hard': 'Складна'
};

export const TaskList = ({ tasks = [], subjects = [], onView }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        Немає завдань для відображення
      </Typography>
    );
  }

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Невідомий предмет';
  };

  const getPriorityColor = (priority) => {
    return priority === 'High' ? 'error' : 'info';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Hard': return 'error';
      default: return 'warning';
    }
  };

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table sx={{ minWidth: 650 }} aria-label="task table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Назва</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Предмет</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Пріоритет</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Складність</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Дедлайн</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id} 
              hover 
              onClick={() => onView(task)}
              sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {task.task_name || 'Без назви'}
              </TableCell>
              <TableCell>{getSubjectName(task.subject_id)}</TableCell>
              <TableCell>
                <Chip 
                  label={priorityTranslations[task.priority] || 'Низький'} 
                  color={getPriorityColor(task.priority)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={difficultyTranslations[task.difficulty] || 'Середня'} 
                  color={getDifficultyColor(task.difficulty)}
                  size="small"
                />
              </TableCell>
              <TableCell>{formatDate(task.deadline)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};