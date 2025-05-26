import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { SubjectList } from './SubjectList';
import { SubjectForm } from './SubjectForm';
import { SubjectViewModal } from './SubjectViewModal';

export const SubjectsManager = ({ 
  open,
  onClose,
  subjects,
  tasks,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);

  const handleSubmit = (subjectData) => {
    if (currentSubject) {
      onUpdate(currentSubject.id, subjectData);
    } else {
      onCreate(subjectData);
    }
    setIsFormOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle>
          Управління предметами
          <Button 
            variant="contained" 
            onClick={() => {
              setCurrentSubject(null);
              setIsFormOpen(true);
            }}
            sx={{ float: 'right' }}
          >
            Додати предмет
          </Button>
        </DialogTitle>
        <DialogContent>
          <SubjectList 
            subjects={subjects}
            tasks={tasks}
            onView={(subject) => {
              setCurrentSubject(subject);
              setIsViewOpen(true);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрити</Button>
        </DialogActions>
      </Dialog>

      <SubjectForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editSubject={currentSubject}
      />

      <SubjectViewModal
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        subject={currentSubject}
        tasks={tasks}
        onEdit={() => {
          setIsFormOpen(true);
          setIsViewOpen(false);
        }}
        onDelete={(id) => {
          onDelete(id);
          setIsViewOpen(false);
        }}
      />
    </>
  );
};