'use client';

/**
 * DevDock Centralized Storage Adapter
 * Type-safe, SSR-safe, fault-tolerant LocalStorage wrapper with reactive event dispatching.
 */

export interface StorageUpdateEventDetail {
  key: string;
  newValue: unknown;
}

const CUSTOM_STORAGE_EVENT = 'devdock-storage-update';

export const storageAdapter = {
  /**
   * Reads and parses a typed key from LocalStorage.
   * If parsing fails or corrupted data is found, safely returns the fallback value.
   */
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[StorageAdapter] Failed to parse key "${key}", using fallback value:`, error);
      return fallback;
    }
  },

  /**
   * Reads a raw string value from LocalStorage.
   */
  getRaw(key: string, fallback: string = ''): string {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : fallback;
    } catch (error) {
      return fallback;
    }
  },

  /**
   * Writes a typed value to LocalStorage and dispatches reactive update events.
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);

      // Dispatch custom same-window event for instant reactive component updates
      window.dispatchEvent(
        new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
          detail: { key, newValue: value },
        })
      );
    } catch (error) {
      console.error(`[StorageAdapter] Failed to write key "${key}":`, error);
    }
  },

  /**
   * Removes a key from LocalStorage.
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
          detail: { key, newValue: null },
        })
      );
    } catch (error) {
      console.error(`[StorageAdapter] Failed to remove key "${key}":`, error);
    }
  },

  /**
   * Checks if a key exists in LocalStorage.
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Clears all storage keys.
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
      window.dispatchEvent(
        new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
          detail: { key: '*', newValue: null },
        })
      );
    } catch (error) {
      console.error('[StorageAdapter] Failed to clear storage:', error);
    }
  },
};
