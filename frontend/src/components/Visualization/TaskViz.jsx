import React from 'react';
import { 
  Box, Paper, Typography, useTheme 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TaskViz = ({ tasks }) => {
  const theme = useTheme();

  const filteredTasks = tasks.filter(task => !task.is_completed);

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isOverdue = (taskDate) => {
    const taskDay = new Date(taskDate);
    taskDay.setHours(0, 0, 0, 0);
    return taskDay < getToday();
  };

  const getDays = () => {
    const days = [];
    const today = getToday();
    
    // Прострочені завдання
    days.push({
      date: new Date(today),
      dayName: 'Прострочені',
      dateStr: 'Прострочені завдання',
      isOverdue: true
    });
    
    // Поточний та наступні 6 днів
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date,
        dayName: date.toLocaleDateString('uk-UA', { weekday: 'short' }),
        dateStr: date.toLocaleDateString('uk-UA'),
        isOverdue: false
      });
    }
    return days;
  };

  const prepareChartData = () => {
    const days = getDays();
    const difficultyOrder = ['Easy', 'Medium', 'Hard'];
    const difficultyNames = {
      'Easy': 'Легкі',
      'Medium': 'Середні', 
      'Hard': 'Складні'
    };

    return days.map(day => {
      const dayTasks = day.isOverdue
        ? filteredTasks.filter(task => isOverdue(task.deadline))
        : filteredTasks.filter(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === day.date.getTime();
          });

      const difficultyCounts = dayTasks.reduce((acc, task) => {
        acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
        return acc;
      }, {});

      const dayData = { 
        name: day.dayName,
        fullDate: day.dateStr
      };

      difficultyOrder.forEach(diff => {
        dayData[diff] = difficultyCounts[diff] || 0;
        dayData[`${diff}Name`] = difficultyNames[diff];
      });

      return {
        ...dayData,
        total: dayTasks.length
      };
    });
  };

  const chartData = prepareChartData();
  const difficultyColors = {
    'Easy': theme.palette.success.main,
    'Medium': theme.palette.warning.main,
    'Hard': theme.palette.error.main
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = chartData.find(d => d.name === label);
      return (
        <Paper sx={{ p: 2 }} elevation={3}>
          <Typography variant="subtitle2">{data.fullDate}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index}>
              {entry.dataKey === 'Easy' ? 'Легкі: ' : 
               entry.dataKey === 'Medium' ? 'Середні: ' : 'Складні: '}
              {entry.value} завдань
            </Typography>
          ))}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Всього: {data.total}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      mb: 4,
      width: '70%',
      mx: 'auto',
      minWidth: 500
    }}>
      <Typography variant="h6" gutterBottom>
        Візуалізація навантаження
      </Typography>
      
      <Box sx={{ 
        height: 400,
        width: '100%'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={0}
            barCategoryGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="Easy" 
              stackId="stack"
              fill={difficultyColors.Easy}
              name="Легкі"
            />
            <Bar 
              dataKey="Medium" 
              stackId="stack"
              fill={difficultyColors.Medium}
              name="Середні"
            />
            <Bar 
              dataKey="Hard" 
              stackId="stack"
              fill={difficultyColors.Hard}
              name="Складні"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TaskViz;