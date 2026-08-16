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
  AcademicLink,
  AcademicAttachmentFile,
} from '@/types/academic';

import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';
import { AcademicData } from '@/types/academic';

const INITIAL_DATA: AcademicData = {
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
};

export function useAcademic() {
  const [data, setData] = useState<AcademicData>(INITIAL_DATA);
  const [isMounted, setIsMounted] = useState(false);

  const loadData = useCallback(() => {
    const loaded = storageAdapter.get<AcademicData>(
      STORAGE_KEYS.ACADEMIC,
      storageAdapter.get<AcademicData>(STORAGE_KEYS.LEGACY_ACADEMIC, INITIAL_DATA)
    );

    if (loaded && loaded.assignments) {
      const todayStr = getTodayYMD();
      const updatedAssignments = loaded.assignments.map((a) => {
        if (a.status !== 'submitted' && a.dueDate < todayStr) {
          return { ...a, status: 'overdue' as AssignmentStatus };
        }
        return a;
      });
      setData({ ...loaded, assignments: updatedAssignments });
    } else {
      setData(loaded || INITIAL_DATA);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, [loadData]);

  // Reactive cross-tab & same-window storage sync
  useStorageSync([STORAGE_KEYS.ACADEMIC, STORAGE_KEYS.LEGACY_ACADEMIC], loadData);

  useEffect(() => {
    if (isMounted) {
      storageAdapter.set(STORAGE_KEYS.ACADEMIC, data);
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

  const addLink = (link: Omit<AcademicLink, 'id' | 'createdAt'>) => {
    const newLink: AcademicLink = {
      ...link,
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, links: [...(prev.links || []), newLink] }));
    return newLink;
  };

  const updateLink = (id: string, updates: Partial<AcademicLink>) => {
    setData((prev) => ({
      ...prev,
      links: (prev.links || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const deleteLink = (id: string) => {
    setData((prev) => ({
      ...prev,
      links: (prev.links || []).filter((l) => l.id !== id),
    }));
  };

  const addFile = (file: Omit<AcademicAttachmentFile, 'id' | 'uploadedAt'>) => {
    const newFile: AcademicAttachmentFile = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: Date.now(),
    };
    setData((prev) => ({ ...prev, files: [...(prev.files || []), newFile] }));
    return newFile;
  };

  const updateFile = (id: string, updates: Partial<AcademicAttachmentFile>) => {
    setData((prev) => ({
      ...prev,
      files: (prev.files || []).map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const deleteFile = (id: string) => {
    setData((prev) => ({
      ...prev,
      files: (prev.files || []).filter((f) => f.id !== id),
    }));
  };

  return {
    isMounted,
    course: data.course,
    semesters: data.semesters,
    subjects: data.subjects,
    assignments: data.assignments,
    links: data.links || [],
    files: data.files || [],
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
    addLink,
    updateLink,
    deleteLink,
    addFile,
    updateFile,
    deleteFile,
  };
}
