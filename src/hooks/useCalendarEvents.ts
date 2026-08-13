'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { AcademicAssignment, AcademicSubject } from '@/types/academic';

const STORAGE_KEY = 'devdock_calendar_events_v1';
const ACADEMIC_KEY = 'devdock_academic_data_v1';

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
        const todayStr = new Date().toISOString().split('T')[0];
        localEvents = [
          {
            id: 'evt-1',
            title: 'Estudar JavaScript & React',
            description: 'Revisar hooks customizados e gerenciamento de estado',
            dateString: todayStr,
            startTime: '14:00',
            endTime: '15:30',
            category: 'Estudos',
            createdAt: Date.now(),
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localEvents));
      }

      // Merge Academic Assignments & Exams into Calendar Events dynamically!
      const academicRaw = localStorage.getItem(ACADEMIC_KEY);
      if (academicRaw) {
        const academicData = JSON.parse(academicRaw);
        const academicAssignments: AcademicAssignment[] = academicData.assignments || [];
        const academicSubjects: AcademicSubject[] = academicData.subjects || [];

        const academicEvents: CalendarEvent[] = academicAssignments.map((a) => {
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

        // Deduplicate
        const merged = [...localEvents];
        academicEvents.forEach((ae) => {
          if (!merged.some((e) => e.id === ae.id)) {
            merged.push(ae);
          }
        });
        setEvents(merged);
      } else {
        setEvents(localEvents);
      }
    } catch (e) {
      console.error('Error loading calendar events:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Save non-academic user events
      const userEventsOnly = events.filter((e) => !e.id.startsWith('academic-evt-'));
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
