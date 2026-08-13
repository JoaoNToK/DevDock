'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

export default function CalendarioPage() {
  const { events, isMounted, addEvent, updateEvent, deleteEvent } = useCalendarEvents();

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <CalendarView
        events={events}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
      />
    </MainLayout>
  );
}
