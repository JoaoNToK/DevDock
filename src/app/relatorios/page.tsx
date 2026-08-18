'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductivityReports } from '@/components/reports/ProductivityReports';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { usePlannerActivities } from '@/hooks/usePlannerActivities';

import { useProjects } from '@/hooks/useProjects';
import { useAcademic } from '@/hooks/useAcademic';

export default function RelatoriosPage() {
  const { sessionRecords, tasks, totalFocusMinutes, dailyGoal, isMounted } = usePomodoroTimer();
  const { activities } = usePlannerActivities();
  const { projects, tasks: kanbanTasks } = useProjects();
  const { subjects, assignments } = useAcademic();

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
      <ProductivityReports
        records={sessionRecords}
        tasks={tasks}
        activities={activities}
        totalFocusMinutes={totalFocusMinutes}
        dailyGoal={dailyGoal}
        projects={projects}
        kanbanTasks={kanbanTasks}
        subjects={subjects}
        assignments={assignments}
      />
    </MainLayout>
  );
}
