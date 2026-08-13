'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeeklyPlanner } from '@/components/planning/WeeklyPlanner';
import { usePlannerActivities } from '@/hooks/usePlannerActivities';

export default function PlanejamentoSemanalPage() {
  const {
    activities,
    isMounted,
    addActivity,
    updateActivity,
    toggleActivityComplete,
    deleteActivity,
  } = usePlannerActivities();

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
      <WeeklyPlanner
        activities={activities}
        onAddActivity={addActivity}
        onUpdateActivity={updateActivity}
        onToggleComplete={toggleActivityComplete}
        onDeleteActivity={deleteActivity}
      />
    </MainLayout>
  );
}
