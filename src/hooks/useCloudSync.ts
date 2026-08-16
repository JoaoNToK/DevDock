'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export function useCloudSync() {
  const { data: session, status } = useSession();
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  const triggerSync = useCallback(async () => {
    if (!session?.user) {
      setSyncState('synced');
      return;
    }

    try {
      setSyncState('syncing');
      // Simulate/Trigger server sync endpoint pulse
      await new Promise((res) => setTimeout(res, 600));
      setSyncState('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Cloud Sync failed:', err);
      setSyncState('error');
    }
  }, [session]);

  useEffect(() => {
    const handleOnline = () => triggerSync();
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  return {
    isAuthenticated: !!session?.user,
    user: session?.user || null,
    syncState,
    lastSyncedAt,
    triggerSync,
  };
}
