'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Subject,
  Topic,
  StudyNote,
  StudyGoal,
  StudyResource,
  TopicStatus,
} from '@/types/studies';

const STORAGE_KEY = 'devdock_studies_data_v2';

interface StudiesData {
  subjects: Subject[];
  topics: Topic[];
  notes: StudyNote[];
  goals: StudyGoal[];
  resources: StudyResource[];
}

export function useStudies() {
  const [data, setData] = useState<StudiesData>({
    subjects: [],
    topics: [],
    notes: [],
    goals: [],
    resources: [],
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        // Initial sample data
        const todayStr = new Date().toISOString().split('T')[0];

        const sampleSubjects: Subject[] = [
          {
            id: 'sub-js',
            name: 'JavaScript',
            description: 'Aprender JavaScript do básico ao avançado',
            color: '#f59e0b',
            monthlyHoursGoal: 20,
            totalTimeMinutes: 750, // 12h 30m
            createdAt: Date.now(),
          },
          {
            id: 'sub-react',
            name: 'React',
            description: 'Desenvolvimento de interfaces modernas com React',
            color: '#06b6d4',
            monthlyHoursGoal: 15,
            totalTimeMinutes: 420, // 7h
            createdAt: Date.now(),
          },
          {
            id: 'sub-db',
            name: 'Banco de Dados',
            description: 'PostgreSQL, SQL e Modelagem de Dados',
            color: '#10b981',
            monthlyHoursGoal: 10,
            totalTimeMinutes: 300, // 5h
            createdAt: Date.now(),
          },
        ];

        const sampleTopics: Topic[] = [
          {
            id: 'top-1',
            subjectId: 'sub-js',
            title: 'Fundamentos & Sintaxe',
            status: 'completed',
            priority: 'high',
            totalTimeMinutes: 120,
            createdAt: Date.now(),
          },
          {
            id: 'top-2',
            subjectId: 'sub-js',
            title: 'Funções & Escopo',
            status: 'completed',
            priority: 'high',
            totalTimeMinutes: 180,
            createdAt: Date.now(),
          },
          {
            id: 'top-3',
            subjectId: 'sub-js',
            title: 'Promises & Assincronismo',
            status: 'in_progress',
            priority: 'high',
            totalTimeMinutes: 240,
            reviewIntervalDays: 1,
            nextReviewDate: todayStr,
            createdAt: Date.now(),
          },
          {
            id: 'top-4',
            subjectId: 'sub-js',
            title: 'Async/Await',
            status: 'in_progress',
            priority: 'high',
            totalTimeMinutes: 210,
            reviewIntervalDays: 3,
            nextReviewDate: todayStr,
            createdAt: Date.now(),
          },
          {
            id: 'top-5',
            subjectId: 'sub-react',
            title: 'Componentes & JSX',
            status: 'completed',
            priority: 'high',
            totalTimeMinutes: 180,
            createdAt: Date.now(),
          },
          {
            id: 'top-6',
            subjectId: 'sub-react',
            title: 'useEffect & Ciclo de Vida',
            status: 'in_progress',
            priority: 'medium',
            totalTimeMinutes: 240,
            reviewIntervalDays: 1,
            nextReviewDate: todayStr,
            createdAt: Date.now(),
          },
          {
            id: 'top-7',
            subjectId: 'sub-db',
            title: 'Relacionamentos & Foreign Keys',
            status: 'not_started',
            priority: 'medium',
            totalTimeMinutes: 0,
            createdAt: Date.now(),
          },
        ];

        const sampleNotes: StudyNote[] = [
          {
            id: 'note-1',
            title: 'Async/Await & Promises',
            content: 'Async/await é uma sintaxe mais limpa para trabalhar com Promises no JS. A palavra-chave async faz a função retornar uma Promise e await pausa a execução até a resolução.',
            subjectId: 'sub-js',
            topicId: 'top-4',
            tags: ['javascript', 'async', 'promises'],
            isPinned: true,
            isArchived: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'note-2',
            title: 'useEffect - Regras de Dependências',
            content: 'Sempre declare todas as variáveis externas usadas no useEffect no array de dependências para evitar stale closures.',
            subjectId: 'sub-react',
            topicId: 'top-6',
            tags: ['react', 'hooks', 'useeffect'],
            isPinned: false,
            isArchived: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const sampleGoals: StudyGoal[] = [
          {
            id: 'goal-1',
            title: 'Estudar JavaScript por 20 horas este mês',
            subjectId: 'sub-js',
            targetValue: 20,
            currentValue: 12.5,
            type: 'hours',
            startDate: todayStr,
            endDate: todayStr,
            createdAt: Date.now(),
          },
          {
            id: 'goal-2',
            title: 'Concluir 5 conteúdos de React',
            subjectId: 'sub-react',
            targetValue: 5,
            currentValue: 2,
            type: 'topics',
            startDate: todayStr,
            endDate: todayStr,
            createdAt: Date.now(),
          },
        ];

        const sampleResources: StudyResource[] = [
          {
            id: 'res-1',
            subjectId: 'sub-js',
            name: 'MDN Web Docs — JavaScript',
            url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript',
            description: 'Guia de referência oficial do JavaScript',
            createdAt: Date.now(),
          },
        ];

        const initialData: StudiesData = {
          subjects: sampleSubjects,
          topics: sampleTopics,
          notes: sampleNotes,
          goals: sampleGoals,
          resources: sampleResources,
        };

        setData(initialData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (e) {
      console.error('Error loading studies data:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isMounted]);

  // Subject Progress calculation helper
  const getSubjectProgress = useCallback(
    (subjectId: string) => {
      const subjectTopics = data.topics.filter((t) => t.subjectId === subjectId);
      if (subjectTopics.length === 0) return 0;
      const completed = subjectTopics.filter((t) => t.status === 'completed').length;
      return Math.round((completed / subjectTopics.length) * 100);
    },
    [data.topics]
  );

  // Subject CRUD
  const addSubject = (sub: Omit<Subject, 'id' | 'totalTimeMinutes' | 'createdAt'>) => {
    const newSub: Subject = {
      ...sub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      totalTimeMinutes: 0,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      topics: prev.topics.filter((t) => t.subjectId !== id),
      notes: prev.notes.filter((n) => n.subjectId !== id),
      goals: prev.goals.filter((g) => g.subjectId !== id),
      resources: prev.resources.filter((r) => r.subjectId !== id),
    }));
  };

  // Topic CRUD
  const addTopic = (top: Omit<Topic, 'id' | 'totalTimeMinutes' | 'createdAt'>) => {
    const newTop: Topic = {
      ...top,
      id: `top-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      totalTimeMinutes: 0,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, topics: [...prev.topics, newTop] }));
    return newTop;
  };

  const updateTopic = (id: string, updates: Partial<Topic>) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const setTopicStatus = (id: string, status: TopicStatus) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  };

  const deleteTopic = (id: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
      notes: prev.notes.filter((n) => n.topicId !== id),
    }));
  };

  // Note CRUD
  const addNote = (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: StudyNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setData((prev) => ({ ...prev, notes: [...prev.notes, newNote] }));
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<StudyNote>) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)),
    }));
  };

  const togglePinNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));
  };

  const toggleArchiveNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  // Goal CRUD
  const addGoal = (goal: Omit<StudyGoal, 'id' | 'currentValue' | 'createdAt'>) => {
    const newGoal: StudyGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      currentValue: 0,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<StudyGoal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Resource CRUD
  const addResource = (res: Omit<StudyResource, 'id' | 'createdAt'>) => {
    const newRes: StudyResource = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setData((prev) => ({ ...prev, resources: [...prev.resources, newRes] }));
    return newRes;
  };

  const deleteResource = (id: string) => {
    setData((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
  };

  // Pomodoro Integration Timer Logging
  const recordStudyTime = (subjectId: string, topicId?: string, minutes: number = 25) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === subjectId ? { ...s, totalTimeMinutes: s.totalTimeMinutes + minutes } : s
      ),
      topics: prev.topics.map((t) =>
        t.id === topicId ? { ...t, totalTimeMinutes: t.totalTimeMinutes + minutes } : t
      ),
    }));
  };

  return {
    isMounted,
    subjects: data.subjects,
    topics: data.topics,
    notes: data.notes,
    goals: data.goals,
    resources: data.resources,
    getSubjectProgress,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    setTopicStatus,
    deleteTopic,
    addNote,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    deleteNote,
    addGoal,
    updateGoal,
    deleteGoal,
    addResource,
    deleteResource,
    recordStudyTime,
  };
}
