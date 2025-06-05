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
  Box
} from '@mui/material';

export const SubjectList = ({ 
  subjects = [], 
  tasks = [],
  onView,
  enableSorting = true
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('name');
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

  const sortedSubjects = enableSorting 
    ? [...subjects].sort((a, b) => {
        if (orderBy === 'taskCount') {
          const countA = tasks.filter(t => t.subject_id === a.id).length;
          const countB = tasks.filter(t => t.subject_id === b.id).length;
          return order === 'asc' ? countA - countB : countB - countA;
        } else {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
      })
    : subjects;

  const getTaskCount = (subjectId) => {
    return tasks.filter(task => task.subject_id === subjectId).length;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('name')} 
                sx={{ cursor: enableSorting ? 'pointer' : 'default' }}
              >
                Назва
              </TableCell>
              <TableCell 
                align="right" 
                onClick={() => handleSort('taskCount')} 
                sx={{ cursor: enableSorting ? 'pointer' : 'default' }}
              >
                Кількість завдань
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSubjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((subject) => (
                <TableRow 
                  key={subject.id} 
                  hover 
                  onClick={() => onView(subject)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{subject.name}</TableCell>
                  <TableCell align="right">{getTaskCount(subject.id)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={subjects.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Рядків на сторінці:"
      />
    </Box>
  );
};