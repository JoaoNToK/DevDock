'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { AcademicAssignment, AcademicSubject } from '@/types/academic';
import { ProjectTask, Project } from '@/types/projects';

const STORAGE_KEY = 'devdock_calendar_events_v1';
const ACADEMIC_KEY = 'devdock_academic_data_v1';
const PROJECTS_KEY = 'devdock_projects_data_v1';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let localEvents: CalendarEvent[] = [];

      if (raw) {
        localEvents = JSON.parse(raw);
      } else {
        localEvents = [];
      }

      // Merge Academic Assignments & Exams into Calendar Events
      const academicRaw = localStorage.getItem(ACADEMIC_KEY);
      let academicEvents: CalendarEvent[] = [];
      if (academicRaw) {
        const academicData = JSON.parse(academicRaw);
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
      const projectsRaw = localStorage.getItem(PROJECTS_KEY);
      let projectEvents: CalendarEvent[] = [];
      if (projectsRaw) {
        const projectsData = JSON.parse(projectsRaw);
        const projList: Project[] = projectsData.projects || [];
        const taskList: ProjectTask[] = projectsData.tasks || [];

        projectEvents = taskList
          .filter((t) => t.dueDate)
          .map((t) => {
            const proj = projList.find((p) => p.id === t.projectId);
            return {
              id: `project-evt-${t.id}`,
              title: `🚀 PROJETO: ${t.title} (${proj?.name || 'Projeto'})`,
              description: t.description || `Prazo de entrega do projeto ${proj?.name || ''}`,
              dateString: t.dueDate!,
              startTime: '18:00',
              endTime: '19:00',
              category: 'Trabalho',
              createdAt: t.createdAt,
            };
          });
      }

      // Merge & Deduplicate
      const merged = [...localEvents];
      [...academicEvents, ...projectEvents].forEach((extEvt) => {
        if (!merged.some((e) => e.id === extEvt.id)) {
          merged.push(extEvt);
        }
      });

      setEvents(merged);
    } catch (e) {
      console.error('Error loading calendar events:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Save non-generated user events only
      const userEventsOnly = events.filter(
        (e) => !e.id.startsWith('academic-evt-') && !e.id.startsWith('project-evt-')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userEventsOnly));
    }
  }, [events, isMounted]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    events,
    isMounted,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
