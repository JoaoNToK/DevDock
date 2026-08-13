'use client';

import { useState, useEffect, useCallback } from 'react';
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
        const todayStr = new Date().toISOString().split('T')[0];
        const updatedAssignments = parsed.assignments.map((a) => {
          if (a.status !== 'submitted' && a.dueDate < todayStr) {
            return { ...a, status: 'overdue' as AssignmentStatus };
          }
          return a;
        });

        setData({ ...parsed, assignments: updatedAssignments });
      } else {
        // Initial sample data
        const todayStr = new Date().toISOString().split('T')[0];
        const in5DaysStr = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
        const in10DaysStr = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

        const sampleSemesters: AcademicSemester[] = [
          {
            id: 'sem-2026-2',
            name: '2026.2 - 3º Semestre',
            period: '2026.2',
            startDate: '2026-08-01',
            endDate: '2026-12-15',
            isCurrent: true,
          },
          {
            id: 'sem-2026-1',
            name: '2026.1 - 2º Semestre',
            period: '2026.1',
            startDate: '2026-02-01',
            endDate: '2026-06-30',
            isCurrent: false,
          },
        ];

        const sampleSubjects: AcademicSubject[] = [
          {
            id: 'ac-sub-db',
            semesterId: 'sem-2026-2',
            name: 'Banco de Dados',
            code: 'BD-301',
            professor: 'Prof. João Silva',
            classroom: 'Lab 04 / Sala 12',
            classDay: 'Segunda-feira',
            classTime: '19:00 - 20:40',
            workloadHours: 80,
            color: '#10b981',
            gradeP1: 8.5,
            gradeP2: 7.5,
            attendancePct: 95,
            createdAt: Date.now(),
          },
          {
            id: 'ac-sub-web',
            semesterId: 'sem-2026-2',
            name: 'Programação Web',
            code: 'WEB-302',
            professor: 'Prof. Carlos Eduardo',
            classroom: 'Lab 02',
            classDay: 'Quarta-feira',
            classTime: '19:00 - 21:30',
            workloadHours: 80,
            color: '#6366f1',
            gradeP1: 9.0,
            gradeP2: 8.0,
            attendancePct: 100,
            createdAt: Date.now(),
          },
          {
            id: 'ac-sub-redes',
            semesterId: 'sem-2026-2',
            name: 'Redes de Computadores',
            code: 'RED-303',
            professor: 'Profª. Ana Maria',
            classroom: 'Sala 15',
            classDay: 'Sexta-feira',
            classTime: '20:50 - 22:30',
            workloadHours: 60,
            color: '#06b6d4',
            gradeP1: 8.0,
            attendancePct: 90,
            createdAt: Date.now(),
          },
        ];

        const sampleAssignments: AcademicAssignment[] = [
          {
            id: 'assig-1',
            subjectId: 'ac-sub-db',
            title: 'Prova P1 — Modelagem & SQL',
            description: 'Prova teórica e prática sobre JOINs, Foreign Keys e Subqueries.',
            type: 'prova',
            dueDate: in5DaysStr,
            dueTime: '19:00',
            location: 'Lab 04',
            weight: 7.0,
            priority: 'high',
            status: 'in_progress',
            checklist: [
              { id: 'chk-1', text: 'Revisar modelo relacional', isCompleted: true },
              { id: 'chk-2', text: 'Resolver lista de exercícios de SQL', isCompleted: true },
              { id: 'chk-3', text: 'Estudar Normalização 3FN', isCompleted: false },
            ],
            createdAt: Date.now(),
          },
          {
            id: 'assig-2',
            subjectId: 'ac-sub-web',
            title: 'Trabalho Prático — API Next.js',
            description: 'Desenvolvimento de uma API RESTful utilizando Server Actions e PostgreSQL.',
            type: 'trabalho',
            dueDate: in10DaysStr,
            dueTime: '23:59',
            location: 'Portal AVA',
            weight: 3.0,
            priority: 'high',
            status: 'in_progress',
            checklist: [
              { id: 'chk-4', text: 'Modelar esquemas de rotas', isCompleted: true },
              { id: 'chk-5', text: 'Criar controladores de rotas', isCompleted: false },
              { id: 'chk-6', text: 'Elaborar documentação no GitHub', isCompleted: false },
            ],
            createdAt: Date.now(),
          },
        ];

        const initialData: AcademicData = {
          course: {
            name: 'Análise e Desenvolvimento de Sistemas',
            institution: 'DevDock Academy / Faculdade Tech',
            currentSemesterName: '3º Semestre',
            currentPeriod: '2026.2',
            year: 2026,
          },
          semesters: sampleSemesters,
          subjects: sampleSubjects,
          assignments: sampleAssignments,
        };

        setData(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
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
