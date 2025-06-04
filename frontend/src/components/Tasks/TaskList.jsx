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
  TableSortLabel,
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

// Порядок сортування для складності та пріоритету
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

export const TaskList = ({ tasks = [], subjects = [], onView }) => {
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
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Невідомий предмет';
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (orderBy) {
      case 'subject':
        const subjectA = getSubjectName(a.subject_id);
        const subjectB = getSubjectName(b.subject_id);
        comparison = subjectA.localeCompare(subjectB);
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
      
      default: // Для назви завдання
        comparison = a.task_name.localeCompare(b.task_name);
    }
    
    return order === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'task_name'}
                  direction={orderBy === 'task_name' ? order : 'asc'}
                  onClick={() => handleSort('task_name')}
                >
                  Назва
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'subject'}
                  direction={orderBy === 'subject' ? order : 'asc'}
                  onClick={() => handleSort('subject')}
                >
                  Предмет
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'priority'}
                  direction={orderBy === 'priority' ? order : 'asc'}
                  onClick={() => handleSort('priority')}
                >
                  Пріоритет
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'difficulty'}
                  direction={orderBy === 'difficulty' ? order : 'asc'}
                  onClick={() => handleSort('difficulty')}
                >
                  Складність
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'deadline'}
                  direction={orderBy === 'deadline' ? order : 'asc'}
                  onClick={() => handleSort('deadline')}
                >
                  Дедлайн
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow 
                  key={task.id} 
                  hover 
                  onClick={() => onView(task)}
                  sx={{ cursor: 'pointer' }}
                >
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
                      color={
                        task.difficulty === 'Easy' ? 'success' : 
                        task.difficulty === 'Hard' ? 'error' : 'warning'
                      }
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