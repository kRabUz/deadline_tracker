import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  Box,
  Slider,
  Typography,
  Paper,
  Stack,
  CircularProgress
} from '@mui/material';
import { TaskList } from './TaskList';
import { TaskViewModal } from './TaskViewModal';
import { TaskForm } from './TaskForm';
import { getRecommendations } from '../../services/taskService';

const RangeSlider = ({ values, onChange }) => {
  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;
    
    if (activeThumb === 0) {
      onChange([Math.min(newValue[0], values[1] - 10), values[1]]);
    } else {
      onChange([values[0], Math.max(newValue[1], values[0] + 10)]);
    }
  };

  return (
    <Slider
      value={values}
      onChange={handleChange}
      min={0}
      max={100}
      disableSwap
      sx={{
        '& .MuiSlider-thumb': {
          backgroundColor: '#1976d2',
        },
        '& .MuiSlider-track': {
          backgroundColor: '#1976d2',
        },
        '& .MuiSlider-rail': {
          backgroundColor: '#e0e0e0'
        }
      }}
    />
  );
};

export const RecommendationsManager = ({ 
  open,
  onClose,
  tasks,
  subjects,
  onUpdate,
  onDelete,
  onToggleComplete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showEasyFirst, setShowEasyFirst] = useState(false);
  const [weights, setWeights] = useState([20, 40]);
  const [recommendationsResults, setRecommendationsResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    const savedWeights = localStorage.getItem('recommendationsWeights');
    const savedEasyFirst = localStorage.getItem('recommendationsEasyFirst');
    
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
    if (savedEasyFirst) {
      setShowEasyFirst(JSON.parse(savedEasyFirst));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recommendationsWeights', JSON.stringify(weights));
    localStorage.setItem('recommendationsEasyFirst', JSON.stringify(showEasyFirst));
  }, [weights, showEasyFirst]);

  const fetchRecommendationsResults = useCallback(async () => {
    if (!open || tasks.length === 0) {
      setRecommendationsResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const priorityWeight = weights[0];
      const difficultyWeight = weights[1] - weights[0];
      const deadlineWeight = 100 - weights[1];

      const results = await getRecommendations(
        [priorityWeight/100, difficultyWeight/100, deadlineWeight/100],
        ['max', showEasyFirst ? 'min' : 'max', 'min']
      );
      
      setRecommendationsResults(results.tasks || []);
    } catch (err) {
      console.error('Recommendations error:', err);
      setError(err.response?.data?.error || err.message || 'Помилка при отриманні рекомендацій');
      setRecommendationsResults([]);
    } finally {
      setLoading(false);
    }
  }, [open, tasks, weights, showEasyFirst]);

  useEffect(() => {
    if (open) {
      fetchRecommendationsResults();
    }
  }, [open, fetchRecommendationsResults, lastUpdated]);

  const handleSubmit = async (taskData) => {
    try {
      if (currentTask) {
        await onUpdate(currentTask.id, taskData);
        setLastUpdated(Date.now());
      }
    } catch (err) {
      setError(err.message || 'Помилка при оновленні завдання');
    } finally {
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.message || 'Помилка при видаленні завдання');
    } finally {
      setIsViewOpen(false);
    }
  };

  const handleToggleCompleteWrapper = async (taskId, isCompleted) => {
    try {
      await onToggleComplete(taskId, isCompleted);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err.message || 'Помилка при зміні статусу');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div">
            Рекомендації щодо виконання завдань
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Stack spacing={3}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={showEasyFirst}
                    onChange={(e) => setShowEasyFirst(e.target.checked)}
                    color="primary"
                  />
                }
                label="Рекомендувати спочатку легкі завдання"
              />
              
              <Box>
                <Typography variant="body1" gutterBottom>
                  Розподіл ваг:
                </Typography>
                <Box sx={{ px: 2, pt: 1 }}>
                  <RangeSlider values={weights} onChange={setWeights} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">
                    Пріоритет: {weights[0]}%
                  </Typography>
                  <Typography variant="caption">
                    Складність: {weights[1]-weights[0]}%
                  </Typography>
                  <Typography variant="caption">
                    Терміновість: {100-weights[1]}%
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TaskList 
            tasks={recommendationsResults}
            subjects={subjects}
            onView={(task) => {
              setCurrentTask(task);
              setIsViewOpen(true);
            }}
            onEdit={(task) => {
              setCurrentTask(task);
              setIsFormOpen(true);
            }}
            onDelete={handleDelete}
            onToggleComplete={handleToggleCompleteWrapper}
            showRecommendationsScores
            enableSorting={false}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Закрити</Button>
        </DialogActions>
      </Dialog>

      <TaskViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={currentTask}
        subjects={subjects}
        onEdit={() => {
          setIsViewOpen(false);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        onToggleComplete={handleToggleCompleteWrapper}
      />

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        task={currentTask}
        subjects={subjects}
      />
    </>
  );
};