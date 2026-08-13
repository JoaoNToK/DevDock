'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';

const STORAGE_KEY = 'devdock_calendar_events_v1';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setEvents(JSON.parse(raw));
      } else {
        // Initial sample events
        const todayStr = new Date().toISOString().split('T')[0];
        const sampleEvents: CalendarEvent[] = [
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
          {
            id: 'evt-2',
            title: 'Reunião de Alinhamento DevDock',
            description: 'Planejamento de novas sprints e funcionalidades',
            dateString: todayStr,
            startTime: '16:00',
            endTime: '17:00',
            category: 'Trabalho',
            createdAt: Date.now(),
          },
        ];
        setEvents(sampleEvents);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
      }
    } catch (e) {
      console.error('Error loading calendar events:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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
