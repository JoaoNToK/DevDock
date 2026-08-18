'use client';

import { useEffect } from 'react';
import { StorageUpdateEventDetail } from './adapter';

/**
 * Custom React hook that subscribes to both cross-tab StorageEvents and same-window StorageUpdateEvents.
 * Triggers a callback whenever the specified key (or any key if targetKey is omitted) changes.
 */
export function useStorageSync(targetKey: string | string[], onSync: () => void): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const keysToWatch = Array.isArray(targetKey) ? targetKey : [targetKey];

    // Cross-tab storage listener
    const handleCrossTabSync = (e: StorageEvent) => {
      if (!e.key || keysToWatch.includes(e.key)) {
        onSync();
      }
    };

    // Same-window custom storage update listener
    const handleSameWindowSync = (e: Event) => {
      const customEvt = e as CustomEvent<StorageUpdateEventDetail>;
      const changedKey = customEvt.detail?.key;
      if (!changedKey || changedKey === '*' || keysToWatch.includes(changedKey)) {
        onSync();
      }
    };

    // DevDock Backup Restored global event listener
    const handleBackupRestored = () => {
      onSync();
    };

    // Account switch listener for strict user profile data isolation
    const handleAccountSwitch = () => {
      onSync();
    };

    window.addEventListener('storage', handleCrossTabSync);
    window.addEventListener('devdock-storage-update', handleSameWindowSync);
    window.addEventListener('devdock-backup-restored', handleBackupRestored);
    window.addEventListener('devdock-account-switch', handleAccountSwitch);

    return () => {
      window.removeEventListener('storage', handleCrossTabSync);
      window.removeEventListener('devdock-storage-update', handleSameWindowSync);
      window.removeEventListener('devdock-backup-restored', handleBackupRestored);
      window.removeEventListener('devdock-account-switch', handleAccountSwitch);
    };
  }, [targetKey, onSync]);
}

export function triggerSync(key: string = '*'): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<StorageUpdateEventDetail>('devdock-storage-update', {
      detail: { key, timestamp: Date.now() },
    })
  );
}
