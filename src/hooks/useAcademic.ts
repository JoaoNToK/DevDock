'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTodayYMD } from '@/lib/date';
import {
  AcademicCourse,
  AcademicSemester,
  AcademicSubject,
  AcademicAssignment,
  AssignmentStatus,
  ChecklistItem,
} from '@/types/academic';

const STORAGE_KEY = 'devdock_academic_data_v1';

interface AcademicData {
  course: AcademicCourse;
  semesters: AcademicSemester[];
  subjects: AcademicSubject[];
  assignments: AcademicAssignment[];
}

export function useAcademic() {
  const [data, setData] = useState<AcademicData>({
    course: {
      name: 'Análise e Desenvolvimento de Sistemas',
      institution: 'DevDock Academy / Faculdade Tech',
      currentSemesterName: '3º Semestre',
      currentPeriod: '2026.2',
      year: 2026,
    },
    semesters: [],
    subjects: [],
    assignments: [],
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AcademicData = JSON.parse(raw);

        // Auto-check overdue assignments
        const todayStr = getTodayYMD();
        const updatedAssignments = parsed.assignments.map((a) => {
          if (a.status !== 'submitted' && a.dueDate < todayStr) {
            return { ...a, status: 'overdue' as AssignmentStatus };
          }
          return a;
        });

        setData({ ...parsed, assignments: updatedAssignments });
      } else {
        setData({
          course: {
            name: '',
            institution: '',
            currentSemesterName: '',
            currentPeriod: '',
            year: new Date().getFullYear(),
          },
          semesters: [],
          subjects: [],
          assignments: [],
        });
      }
    } catch (e) {
      console.error('Error loading academic data:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isMounted]);

  // Course management
  const updateCourse = (courseData: Partial<AcademicCourse>) => {
    setData((prev) => ({
      ...prev,
      course: { ...prev.course, ...courseData },
    }));
  };

  // Semesters management
  const addSemester = (sem: Omit<AcademicSemester, 'id'>) => {
    const newSem: AcademicSemester = {
      ...sem,
      id: `sem-${Date.now()}`,
    };
    setData((prev) => ({ ...prev, semesters: [...prev.semesters, newSem] }));
    return newSem;
  };

  const updateSemester = (id: string, updates: Partial<AcademicSemester>) => {
    setData((prev) => ({
      ...prev,
      semesters: prev.semesters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSemester = (id: string) => {
    setData((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((s) => s.id !== id),
      subjects: prev.subjects.filter((sub) => sub.semesterId !== id),
    }));
  };

  // Academic Subjects CRUD
  const addSubject = (subject: Omit<AcademicSubject, 'id' | 'createdAt'>) => {
    const newSub: AcademicSubject = {
      ...subject,
      id: `ac-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<AcademicSubject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      assignments: prev.assignments.filter((a) => a.subjectId !== id),
    }));
  };

  // Assignments / Exams CRUD
  const addAssignment = (assig: Omit<AcademicAssignment, 'id' | 'createdAt'>) => {
    const newAssig: AcademicAssignment = {
      ...assig,
      id: `assig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, assignments: [...prev.assignments, newAssig] }));
    return newAssig;
  };

  const updateAssignment = (id: string, updates: Partial<AcademicAssignment>) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const setAssignmentStatus = (id: string, status: AssignmentStatus) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  };

  const toggleChecklistItem = (assignmentId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const updatedChecklist = a.checklist.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );

        // Calculate progress percentage
        const completed = updatedChecklist.filter((i) => i.isCompleted).length;
        let newStatus = a.status;
        if (completed === updatedChecklist.length && updatedChecklist.length > 0) {
          newStatus = 'submitted';
        } else if (completed > 0 && a.status === 'not_started') {
          newStatus = 'in_progress';
        }

        return { ...a, checklist: updatedChecklist, status: newStatus };
      }),
    }));
  };

  const deleteAssignment = (id: string) => {
    setData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  };

  return {
    isMounted,
    course: data.course,
    semesters: data.semesters,
    subjects: data.subjects,
    assignments: data.assignments,
    updateCourse,
    addSemester,
    updateSemester,
    deleteSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    addAssignment,
    updateAssignment,
    setAssignmentStatus,
    toggleChecklistItem,
    deleteAssignment,
  };
}
