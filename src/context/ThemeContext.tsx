'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, storageAdapter, useStorageSync } from '@/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [isMounted, setIsMounted] = useState(false);

  // Helper to determine system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Helper to apply theme classes to <html> element
  const applyThemeToDocument = useCallback((resTheme: ResolvedTheme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (resTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', resTheme);
  }, []);

  const loadTheme = useCallback(() => {
    const savedTheme = storageAdapter.getRaw(
      STORAGE_KEYS.THEME,
      storageAdapter.getRaw(STORAGE_KEYS.LEGACY_THEME, 'system')
    ) as ThemePreference;

    const initialTheme: ThemePreference = ['light', 'dark', 'system'].includes(savedTheme)
      ? savedTheme
      : 'system';

    setThemeState(initialTheme);

    const actualResolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
    setResolvedTheme(actualResolved);
    applyThemeToDocument(actualResolved);
  }, [applyThemeToDocument]);

  useEffect(() => {
    setIsMounted(true);
    loadTheme();
  }, [loadTheme]);

  // Reactive cross-tab & same-window storage sync for themes
  useStorageSync([STORAGE_KEYS.THEME, STORAGE_KEYS.LEGACY_THEME], loadTheme);

  // Handle explicit theme changes
  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    storageAdapter.set(STORAGE_KEYS.THEME, newTheme);

    const actualResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(actualResolved);
    applyThemeToDocument(actualResolved);
  };

  // Listen to system preference changes when theme === 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const newSystemTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newSystemTheme);
        applyThemeToDocument(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, applyThemeToDocument]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
