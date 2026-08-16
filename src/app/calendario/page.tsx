'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { usePlannerActivities } from '@/hooks/usePlannerActivities';
import { useProjects } from '@/hooks/useProjects';
import { useAcademic } from '@/hooks/useAcademic';

export default function CalendarioPage() {
  const { events, isMounted: isCalMounted, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { activities, isMounted: isPlanMounted, addActivity, updateActivity, toggleActivityComplete, deleteActivity } = usePlannerActivities();
  const { tasks: projectTasks, isMounted: isProjMounted } = useProjects();
  const { assignments: academicAssignments, isMounted: isAcadMounted } = useAcademic();

  const isMounted = isCalMounted && isPlanMounted && isProjMounted && isAcadMounted;

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
        activities={activities}
        projectTasks={projectTasks}
        academicAssignments={academicAssignments}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onAddActivity={addActivity}
        onUpdateActivity={updateActivity}
        onToggleActivityComplete={toggleActivityComplete}
        onDeleteActivity={deleteActivity}
      />
    </MainLayout>
  );
}
