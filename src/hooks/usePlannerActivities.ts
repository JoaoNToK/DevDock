'use client';

import { useState, useEffect } from 'react';
import { PlannerActivity } from '@/types/planner';

const STORAGE_KEY = 'devdock_planner_activities_v1';

export function usePlannerActivities() {
  const [activities, setActivities] = useState<PlannerActivity[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setActivities(JSON.parse(raw));
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        const sampleActivities: PlannerActivity[] = [
          {
            id: 'act-1',
            title: 'Estudar Arquitetura de Software',
            description: 'Foco em PWA e estado sincronizado local-first',
            dateString: todayStr,
            startTime: '08:00',
            durationMinutes: 60,
            isCompleted: true,
            category: 'Estudos',
            priority: 'high',
            createdAt: Date.now(),
          },
          {
            id: 'act-2',
            title: 'Sessão de Foco Pomodoro DevDock',
            description: 'Desenvolvimento das novas telas e sidebar responsiva',
            dateString: todayStr,
            startTime: '10:00',
            durationMinutes: 90,
            isCompleted: false,
            category: 'Trabalho',
            priority: 'high',
            createdAt: Date.now(),
          },
          {
            id: 'act-3',
            title: 'Exercícios Físicos / Caminhada',
            description: 'Manter a energia e produtividade altas',
            dateString: todayStr,
            startTime: '18:00',
            durationMinutes: 45,
            isCompleted: false,
            category: 'Saúde',
            priority: 'medium',
            createdAt: Date.now(),
          },
        ];
        setActivities(sampleActivities);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleActivities));
      }
    } catch (e) {
      console.error('Error loading planner activities:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, isMounted]);

  const addActivity = (actData: Omit<PlannerActivity, 'id' | 'createdAt'>) => {
    const newAct: PlannerActivity = {
      ...actData,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setActivities((prev) => [...prev, newAct]);
    return newAct;
  };

  const updateActivity = (id: string, updates: Partial<PlannerActivity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const toggleActivityComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isCompleted: !a.isCompleted } : a))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    activities,
    isMounted,
    addActivity,
    updateActivity,
    toggleActivityComplete,
    deleteActivity,
  };
}
