'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { AcademicAssignment, AcademicSubject } from '@/types/academic';
import { ProjectTask, Project } from '@/types/projects';
import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadEvents = useCallback(() => {
    const localEvents = storageAdapter.get<CalendarEvent[]>(
      STORAGE_KEYS.CALENDAR,
      storageAdapter.get<CalendarEvent[]>(STORAGE_KEYS.LEGACY_CALENDAR, [])
    );

    // Merge Academic Assignments & Exams into Calendar Events
    const academicData = storageAdapter.get<{ assignments?: AcademicAssignment[]; subjects?: AcademicSubject[] }>(
      STORAGE_KEYS.ACADEMIC,
      storageAdapter.get<{ assignments?: AcademicAssignment[]; subjects?: AcademicSubject[] }>(STORAGE_KEYS.LEGACY_ACADEMIC, {})
    );

    let academicEvents: CalendarEvent[] = [];
    if (academicData && academicData.assignments) {
      const academicAssignments: AcademicAssignment[] = academicData.assignments || [];
      const academicSubjects: AcademicSubject[] = academicData.subjects || [];

      academicEvents = academicAssignments.map((a) => {
        const sub = academicSubjects.find((s) => s.id === a.subjectId);
        const iconPrefix =
          a.type === 'prova' ? '📝 PROVA: ' : a.type === 'trabalho' ? '📄 TRABALHO: ' : '🎓 FACULDADE: ';
        return {
          id: `academic-evt-${a.id}`,
          title: `${iconPrefix}${a.title} (${sub?.name || 'Faculdade'})`,
          description: a.description || `Entrega/Prova da disciplina ${sub?.name || 'Acadêmica'}`,
          dateString: a.dueDate,
          startTime: a.dueTime || '19:00',
          endTime: '20:30',
          category: a.type === 'prova' ? 'Prova' : 'Faculdade',
          createdAt: a.createdAt,
        };
      });
    }

    // Merge Project Tasks with deadlines into Calendar Events
    const projectsData = storageAdapter.get<{ projects?: Project[]; tasks?: ProjectTask[] }>(
      STORAGE_KEYS.PROJECTS,
      storageAdapter.get<{ projects?: Project[]; tasks?: ProjectTask[] }>(STORAGE_KEYS.LEGACY_PROJECTS, {})
    );

    let projectEvents: CalendarEvent[] = [];
    if (projectsData && projectsData.tasks) {
      const projList: Project[] = projectsData.projects || [];
      const taskList: ProjectTask[] = projectsData.tasks || [];

      projectEvents = taskList
        .filter((t) => t.dueDate)
        .map((t) => {
          const proj = projList.find((p) => p.id === t.projectId);
          return {
            id: `proj-task-evt-${t.id}`,
            title: `🚀 ${t.title} (${proj?.name || 'Projeto'})`,
            description: t.description || `Prazo de entrega da tarefa do projeto ${proj?.name || ''}`,
            dateString: t.dueDate!,
            startTime: '09:00',
            endTime: '18:00',
            category: 'Trabalho',
            createdAt: t.createdAt,
          };
        });
    }

    // Combined Events
    setEvents([...localEvents, ...academicEvents, ...projectEvents]);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadEvents();
  }, [loadEvents]);

  // Reactive cross-tab & same-window storage sync across all calendar event providers
  useStorageSync(
    [
      STORAGE_KEYS.CALENDAR,
      STORAGE_KEYS.ACADEMIC,
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.LEGACY_CALENDAR,
      STORAGE_KEYS.LEGACY_ACADEMIC,
      STORAGE_KEYS.LEGACY_PROJECTS,
    ],
    loadEvents
  );

  const saveUserEvents = (allEvents: CalendarEvent[]) => {
    const userEventsOnly = allEvents.filter(
      (e) => !e.id.startsWith('academic-evt-') && !e.id.startsWith('proj-task-evt-')
    );
    storageAdapter.set(STORAGE_KEYS.CALENDAR, userEventsOnly);
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setEvents((prev) => {
      const next = [...prev, newEvent];
      saveUserEvents(next);
      return next;
    });
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveUserEvents(next);
      return next;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveUserEvents(next);
      return next;
    });
  };

  return {
    events,
    isMounted,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
