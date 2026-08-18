'use client';

/**
 * DevDock Centralized Storage Adapter
 * Type-safe, SSR-safe, fault-tolerant LocalStorage wrapper with user namespace isolation & reactive event dispatching.
 */

export interface StorageUpdateEventDetail {
  key: string;
  newValue: unknown;
}

const CUSTOM_STORAGE_EVENT = 'devdock-storage-update';
const CUSTOM_ACCOUNT_SWITCH_EVENT = 'devdock-account-switch';

let currentNamespacePrefix = 'guest';

function sanitizeNamespace(identifier: string): string {
  return identifier.toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
}

export const storageAdapter = {
  /**
   * Sets the active user namespace for storage isolation.
   */
  setUserNamespace(userIdentifier?: string | null): void {
    const newPrefix = userIdentifier ? sanitizeNamespace(userIdentifier) : 'guest';
    if (currentNamespacePrefix !== newPrefix) {
      const prev = currentNamespacePrefix;
      currentNamespacePrefix = newPrefix;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(CUSTOM_ACCOUNT_SWITCH_EVENT, {
            detail: { prevNamespace: prev, currentNamespace: newPrefix },
          })
        );
        window.dispatchEvent(
          new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
            detail: { key: '*', newValue: null },
          })
        );
      }
    }
  },

  /**
   * Returns the current active user namespace prefix.
   */
  getUserNamespace(): string {
    return currentNamespacePrefix;
  },

  /**
   * Transforms a base key into a user-scoped storage key.
   */
  getScopedKey(key: string): string {
    // If key is global/unscoped (like CURRENT_USER or THEME), return as is
    if (
      key === 'devdock:current_user_v1' ||
      key === 'devdock:theme_preference_v1' ||
      key === 'devdock_theme_preference_v1'
    ) {
      return key;
    }
    // If already fully scoped, return as is
    if (key.startsWith('devdock:usr:')) {
      return key;
    }
    return `devdock:usr:${currentNamespacePrefix}:${key}`;
  },

  /**
   * Reads and parses a typed key from LocalStorage using user scope.
   */
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const scopedKey = this.getScopedKey(key);
    try {
      const raw = localStorage.getItem(scopedKey);
      if (raw === null) {
        // Fallback: Check if there is un-namespaced data to migrate once for the FIRST logged-in user
        const unnamespacedRaw = localStorage.getItem(key);
        if (unnamespacedRaw !== null && currentNamespacePrefix !== 'guest') {
          try {
            const parsed = JSON.parse(unnamespacedRaw) as T;
            this.set(key, parsed);
            localStorage.removeItem(key);
            return parsed;
          } catch (e) {
            return fallback;
          }
        }
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[StorageAdapter] Failed to parse key "${scopedKey}", using fallback value:`, error);
      return fallback;
    }
  },

  /**
   * Reads a raw string value from LocalStorage using user scope.
   */
  getRaw(key: string, fallback: string = ''): string {
    if (typeof window === 'undefined') return fallback;
    const scopedKey = this.getScopedKey(key);
    try {
      const raw = localStorage.getItem(scopedKey);
      return raw !== null ? raw : fallback;
    } catch (error) {
      return fallback;
    }
  },

  /**
   * Writes a typed value to LocalStorage using user scope and dispatches reactive update events.
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    const scopedKey = this.getScopedKey(key);
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const existing = localStorage.getItem(scopedKey);

      // Prevent redundant writes and infinite event loops if content has not changed
      if (existing === serialized) return;

      localStorage.setItem(scopedKey, serialized);

      // Dispatch custom same-window event for instant reactive component updates
      window.dispatchEvent(
        new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
          detail: { key, newValue: value },
        })
      );
    } catch (error) {
      console.error(`[StorageAdapter] Failed to write key "${scopedKey}":`, error);
    }
  },

  /**
   * Removes a key from LocalStorage using user scope.
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    const scopedKey = this.getScopedKey(key);
    try {
      localStorage.removeItem(scopedKey);
      window.dispatchEvent(
        new CustomEvent<StorageUpdateEventDetail>(CUSTOM_STORAGE_EVENT, {
          detail: { key, newValue: null },
        })
      );
    } catch (error) {
      console.error(`[StorageAdapter] Failed to remove key "${scopedKey}":`, error);
    }
  },

  /**
   * Checks if a key exists in LocalStorage using user scope.
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    const scopedKey = this.getScopedKey(key);
    try {
      return localStorage.getItem(scopedKey) !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Clears all storage keys for the active user namespace.
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      const prefix = `devdock:usr:${currentNamespacePrefix}:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

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
