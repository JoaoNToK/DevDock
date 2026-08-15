'use client';

import { useState, useEffect } from 'react';
import { PlannerActivity } from '@/types/planner';

import { useCallback } from 'react';
import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';

export function usePlannerActivities() {
  const [activities, setActivities] = useState<PlannerActivity[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadActivities = useCallback(() => {
    const loaded = storageAdapter.get<PlannerActivity[]>(
      STORAGE_KEYS.PLANNER,
      storageAdapter.get<PlannerActivity[]>(STORAGE_KEYS.LEGACY_PLANNER, [])
    );
    setActivities(loaded);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadActivities();
  }, [loadActivities]);

  // Reactive cross-tab & same-window storage sync
  useStorageSync([STORAGE_KEYS.PLANNER, STORAGE_KEYS.LEGACY_PLANNER], loadActivities);

  useEffect(() => {
    if (isMounted) {
      storageAdapter.set(STORAGE_KEYS.PLANNER, activities);
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
