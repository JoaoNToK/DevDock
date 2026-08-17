'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { storageAdapter } from '@/lib/storage';
import {
  syncCategoriesAction,
  syncTasksAction,
  syncAcademicResourcesAction,
} from '@/app/actions/cloudSyncActions';
import { Category } from '@/types/category';
import { Task } from '@/types/task';
import { AcademicData } from '@/types/academic';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export function useCloudSync() {
  const { data: session } = useSession();
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  const triggerSync = useCallback(async () => {
    if (!session?.user) {
      setSyncState('synced');
      return;
    }

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setSyncState('offline');
      return;
    }

    try {
      setSyncState('syncing');

      // 1. Read local data from storageAdapter
      const localCategories = storageAdapter.get<Category[]>('devdock:categories_v1', []);
      const localTasks = storageAdapter.get<Task[]>('devdock:pomodoro_tasks_v1', []);
      const academicData = storageAdapter.get<AcademicData>('devdock:academic_v1', {
        course: { name: '', institution: '', currentSemesterName: '', currentPeriod: '', year: 2026 },
        semesters: [],
        subjects: [],
        assignments: [],
        links: [],
        files: [],
      });

      // 2. Dispatch Server Actions to sync with Prisma PostgreSQL
      if (localCategories.length > 0) {
        await syncCategoriesAction(localCategories);
      }

      if (localTasks.length > 0) {
        await syncTasksAction(localTasks);
      }

      if ((academicData.links && academicData.links.length > 0) || (academicData.files && academicData.files.length > 0)) {
        await syncAcademicResourcesAction(academicData.links || [], academicData.files || []);
      }

      setSyncState('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Cloud Sync failed:', err);
      setSyncState('error');
    }
  }, [session]);

  // Handle Online / Offline & Periodic Auto Sync
  useEffect(() => {
    const handleOnline = () => triggerSync();
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync pulse on mount when session is ready
    if (session?.user) {
      triggerSync();
    }

    // Periodic Background Sync Pulse (Every 60s)
    const intervalId = setInterval(() => {
      if (session?.user && navigator.onLine) {
        triggerSync();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [session, triggerSync]);

  return {
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    syncState,
    lastSyncedAt,
    triggerSync,
  };
}
