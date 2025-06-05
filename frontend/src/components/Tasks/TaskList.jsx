import React, { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Box,
  Chip
} from '@mui/material';

const priorityTranslations = {
  'Low': 'Низький',
  'High': 'Високий'
};

const difficultyTranslations = {
  'Easy': 'Легка',
  'Medium': 'Середня',
  'Hard': 'Складна'
};

const sortOrder = {
  difficulty: {
    'Easy': 1,
    'Medium': 2,
    'Hard': 3
  },
  priority: {
    'Low': 1,
    'High': 2
  }
};

export const TaskList = ({ 
  tasks = [], 
  subjects = [], 
  onView, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  showTopsisScores = false,
  enableSorting = true
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('deadline');
  const [order, setOrder] = useState('asc');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    if (!enableSorting) return;
    
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Невідомий предмет';
  };

  const sortedTasks = enableSorting 
    ? [...tasks].sort((a, b) => {
        let comparison = 0;
        
        switch (orderBy) {
          case 'subject':
            comparison = getSubjectName(a.subject_id).localeCompare(getSubjectName(b.subject_id));
            break;
          case 'difficulty':
            comparison = sortOrder.difficulty[a.difficulty] - sortOrder.difficulty[b.difficulty];
            break;
          case 'priority':
            comparison = sortOrder.priority[a.priority] - sortOrder.priority[b.priority];
            break;
          case 'deadline':
            comparison = new Date(a.deadline) - new Date(b.deadline);
            break;
          default:
            comparison = a.task_name.localeCompare(b.task_name);
        }
        
        return order === 'asc' ? comparison : -comparison;
      })
    : tasks;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('task_name')} sx={{ cursor: enableSorting ? 'pointer' : 'default' }}>
                Назва
              </TableCell>
              <TableCell onClick={() => handleSort('subject')} sx={{ cursor: enableSorting ? 'pointer' : 'default' }}>
                Предмет
              </TableCell>
              <TableCell onClick={() => handleSort('priority')} sx={{ cursor: enableSorting ? 'pointer' : 'default' }}>
                Пріоритет
              </TableCell>
              <TableCell onClick={() => handleSort('difficulty')} sx={{ cursor: enableSorting ? 'pointer' : 'default' }}>
                Складність
              </TableCell>
              <TableCell onClick={() => handleSort('deadline')} sx={{ cursor: enableSorting ? 'pointer' : 'default' }}>
                Дедлайн
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
              <TableRow key={task.id} hover onClick={() => onView(task)} sx={{ cursor: 'pointer' }}>
                <TableCell>{task.task_name}</TableCell>
                <TableCell>{getSubjectName(task.subject_id)}</TableCell>
                <TableCell>
                  <Chip 
                    label={priorityTranslations[task.priority]} 
                    color={task.priority === 'High' ? 'error' : 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={difficultyTranslations[task.difficulty]} 
                    color={task.difficulty === 'Easy' ? 'success' : task.difficulty === 'Hard' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(task.deadline)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={tasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Рядків на сторінці:"
      />
    </Box>
  );
};