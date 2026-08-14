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
        setData({
          subjects: [],
          topics: [],
          notes: [],
          goals: [],
          resources: [],
        });
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
