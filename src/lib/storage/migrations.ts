import { STORAGE_KEYS } from './keys';
import { storageAdapter } from './adapter';

/**
 * Migration Engine for LocalStorage keys.
 * Automatically checks and converts legacy keys to namespaced `devdock:*` keys seamlessly.
 */
export function runStorageMigrations(): void {
  if (typeof window === 'undefined') return;

  const keyMap: Array<{ legacyKey: string; targetKey: string }> = [
    { legacyKey: STORAGE_KEYS.LEGACY_PROJECTS, targetKey: STORAGE_KEYS.PROJECTS },
    { legacyKey: STORAGE_KEYS.LEGACY_STUDIES, targetKey: STORAGE_KEYS.STUDIES },
    { legacyKey: STORAGE_KEYS.LEGACY_ACADEMIC, targetKey: STORAGE_KEYS.ACADEMIC },
    { legacyKey: STORAGE_KEYS.LEGACY_CALENDAR, targetKey: STORAGE_KEYS.CALENDAR },
    { legacyKey: STORAGE_KEYS.LEGACY_PLANNER, targetKey: STORAGE_KEYS.PLANNER },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_SETTINGS, targetKey: STORAGE_KEYS.POMODORO_SETTINGS },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_SESSIONS, targetKey: STORAGE_KEYS.POMODORO_SESSIONS },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_TOTAL_FOCUS, targetKey: STORAGE_KEYS.POMODORO_TOTAL_FOCUS },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_DAILY_GOAL, targetKey: STORAGE_KEYS.POMODORO_DAILY_GOAL },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_VOLUME, targetKey: STORAGE_KEYS.POMODORO_VOLUME },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_RECORDS, targetKey: STORAGE_KEYS.POMODORO_RECORDS },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_TASKS, targetKey: STORAGE_KEYS.POMODORO_TASKS },
    { legacyKey: STORAGE_KEYS.LEGACY_POMODORO_ACTIVE_TASK, targetKey: STORAGE_KEYS.POMODORO_ACTIVE_TASK },
    { legacyKey: STORAGE_KEYS.LEGACY_THEME, targetKey: STORAGE_KEYS.THEME },
    { legacyKey: STORAGE_KEYS.LEGACY_NOTIFICATIONS, targetKey: STORAGE_KEYS.NOTIFICATIONS },
  ];

  keyMap.forEach(({ legacyKey, targetKey }) => {
    // If target key does not exist yet but legacy key exists, copy data over
    if (!storageAdapter.has(targetKey) && storageAdapter.has(legacyKey)) {
      const rawLegacy = localStorage.getItem(legacyKey);
      if (rawLegacy !== null) {
        localStorage.setItem(targetKey, rawLegacy);
        console.log(`[StorageMigrations] Migrated "${legacyKey}" -> "${targetKey}"`);
      }
    }
  });
}
